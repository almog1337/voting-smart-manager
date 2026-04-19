import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import {
  ICandidate,
  ICandidateTicket,
  ICommittee,
  IPublicRole,
  IRole,
} from '../schemas/candidate.schema.js';
import { ITicket } from '../schemas/ticket.schema.js';
import { ITicketAttribute } from '../schemas/ticket-attribute.schema.js';
import {
  MODEL_CANDIDATE,
  MODEL_TICKET,
  MODEL_TICKET_ATTRIBUTE,
} from '../schemas/schema.providers.js';

export interface ScoringJobResult {
  processedAt: Date;
  candidatesProcessed: number;
  candidatesUpdated: number;
  durationMs: number;
  errors: { candidateId: string; message: string }[];
}

@Injectable()
export class ScoringJobsService {
  private readonly logger = new Logger(ScoringJobsService.name);

  constructor(
    @Inject(MODEL_CANDIDATE)
    private readonly candidateModel: Model<ICandidate>,
    @Inject(MODEL_TICKET)
    private readonly ticketModel: Model<ITicket>,
    @Inject(MODEL_TICKET_ATTRIBUTE)
    private readonly attributeModel: Model<ITicketAttribute>,
  ) {}

  @Cron(process.env.SCORING_JOB_CRON ?? '0 0 * * *')
  async scheduledRun(): Promise<void> {
    this.logger.log('Scheduled scoring job starting');
    try {
      const result = await this.runScoringJob();
      this.logger.log(
        `Scheduled scoring job completed — processed: ${result.candidatesProcessed}, ` +
          `updated: ${result.candidatesUpdated}, errors: ${result.errors.length}, ` +
          `duration: ${result.durationMs}ms`,
      );
    } catch (err: unknown) {
      this.logger.error('Scheduled scoring job failed', err);
    }
  }

  async runScoringJob(): Promise<ScoringJobResult> {
    const startedAt = Date.now();
    const processedAt = new Date();
    const errors: ScoringJobResult['errors'] = [];
    let candidatesProcessed = 0;
    let candidatesUpdated = 0;

    const [rules, tickets] = await Promise.all([
      this.attributeModel.find().lean() as unknown as ITicketAttribute[],
      this.ticketModel.find().lean() as unknown as ITicket[],
    ]);

    const ticketById = new Map<string, ITicket>(
      tickets.map((t) => [(t as any)._id.toString(), t]),
    );

    const BATCH_SIZE = 100;
    let skip = 0;

    while (true) {
      const batch = (await this.candidateModel
        .find()
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean()) as unknown as (ICandidate & { _id: Types.ObjectId })[];

      if (batch.length === 0) break;

      const bulkOps: any[] = [];

      for (const candidate of batch) {
        candidatesProcessed++;
        try {
          const computedTickets = this.computeCandidateTickets(
            candidate,
            rules,
            ticketById,
          );
          bulkOps.push({
            updateOne: {
              filter: { _id: candidate._id },
              update: { $set: { tickets: computedTickets } },
            },
          });
          candidatesUpdated++;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push({ candidateId: candidate._id.toString(), message });
          this.logger.warn(
            `Error scoring candidate ${candidate._id}: ${message}`,
          );
        }
      }

      if (bulkOps.length > 0) {
        await this.candidateModel.bulkWrite(bulkOps);
      }

      skip += batch.length;
      if (batch.length < BATCH_SIZE) break;
    }

    return {
      processedAt,
      candidatesProcessed,
      candidatesUpdated,
      durationMs: Date.now() - startedAt,
      errors,
    };
  }

  // ----------------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------------

  private computeCandidateTickets(
    candidate: ICandidate,
    rules: ITicketAttribute[],
    ticketById: Map<string, ITicket>,
  ): ICandidateTicket[] {
    // scores[ticketId][vectorName] = accumulated score
    const scores = new Map<string, Map<string, number>>();

    for (const rule of rules) {
      if (!this.matchesRule(candidate, rule)) continue;

      for (const ticketId of rule.tickets) {
        const tid = ticketId.toString();
        if (!ticketById.has(tid)) continue;

        if (!scores.has(tid)) scores.set(tid, new Map());
        const vectorMap = scores.get(tid)!;

        for (const vectorName of rule.vectorNames) {
          vectorMap.set(vectorName, (vectorMap.get(vectorName) ?? 0) + rule.score);
        }
      }
    }

    if (scores.size === 0) return [];

    // Determine primary ticket: highest sum of all vector scores
    let primaryTicketId = '';
    let primaryTotal = -Infinity;
    for (const [tid, vectorMap] of scores) {
      const total = Array.from(vectorMap.values()).reduce((a, b) => a + b, 0);
      if (total > primaryTotal) {
        primaryTotal = total;
        primaryTicketId = tid;
      }
    }

    const result: ICandidateTicket[] = [];
    for (const [tid, vectorMap] of scores) {
      const ticket = ticketById.get(tid)!;
      const vectors = Array.from(vectorMap.entries())
        .filter(([, score]) => score > 0)
        .map(([vectorName, score]) => ({ vectorName, score }));

      if (vectors.length === 0) continue;

      result.push({
        ticketId: new Types.ObjectId(tid),
        ticketName: ticket.name,
        isPrimary: tid === primaryTicketId,
        vectors,
      });
    }

    return result;
  }

  private matchesRule(candidate: ICandidate, rule: ITicketAttribute): boolean {
    const { type, identifiers } = rule;
    const normalize = (s?: string) => s?.trim().toLowerCase() ?? '';

    switch (type) {
      case 'committee': {
        return candidate.committees.some((c: ICommittee) => {
          const nameMatch =
            !identifiers.committeeName ||
            normalize(c.committeeName) === normalize(identifiers.committeeName);
          const typeMatch =
            !identifiers.participationType ||
            c.participationType === identifiers.participationType;
          return nameMatch && typeMatch;
        });
      }

      case 'sub_committee': {
        // sub-committees are modelled as committees where a subCommitteeName is set
        // on the rule's identifiers; the committee itself is the parent
        return candidate.committees.some((c: ICommittee) => {
          const parentMatch =
            !identifiers.committeeName ||
            normalize(c.committeeName) === normalize(identifiers.committeeName);
          const typeMatch =
            !identifiers.participationType ||
            c.participationType === identifiers.participationType;
          // subCommitteeName on the rule must exist; candidate must be in that committee
          return (
            !!identifiers.subCommitteeName && parentMatch && typeMatch
          );
        });
      }

      case 'government_ministry': {
        return candidate.roles.some((r: IRole) => {
          if (r.roleType !== 'public') return false;
          const publicRole = r as IPublicRole;
          return (
            !identifiers.ministryName ||
            normalize(publicRole.ministry) === normalize(identifiers.ministryName)
          );
        });
      }

      case 'role_type': {
        return candidate.roles.some(
          (r: IRole) =>
            !identifiers.roleType || r.roleType === identifiers.roleType,
        );
      }

      case 'education_field': {
        return candidate.education.some(
          (e) =>
            !identifiers.field ||
            normalize(e.field) === normalize(identifiers.field),
        );
      }

      case 'residence_district': {
        return candidate.residence.some(
          (r) =>
            !identifiers.district ||
            normalize(r.district) === normalize(identifiers.district),
        );
      }

      default:
        return false;
    }
  }
}
