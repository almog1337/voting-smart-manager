import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from 'antd';
import {
  useCreateTicketAttribute,
  useTicketAttribute,
  useUpdateTicketAttribute,
} from '../hooks/useTicketAttributes';
import { useTickets } from '../hooks/useTickets';

const ATTRIBUTE_TYPE_VALUES = [
  'committee',
  'sub_committee',
  'government_ministry',
  'role_type',
  'education_field',
  'residence_district',
] as const;

const ATTRIBUTE_TYPE_OPTIONS = [
  { value: 'committee', label: 'ועדה' },
  { value: 'sub_committee', label: 'תת-ועדה' },
  { value: 'government_ministry', label: 'משרד ממשלתי' },
  { value: 'role_type', label: 'סוג תפקיד' },
  { value: 'education_field', label: 'תחום השכלה' },
  { value: 'residence_district', label: 'מחוז מגורים' },
];

const ROLE_TYPE_OPTIONS = [
  { value: 'party', label: 'מפלגה' },
  { value: 'military', label: 'צבאי' },
  { value: 'knesset', label: 'כנסת' },
  { value: 'public', label: 'ציבורי' },
  { value: 'other', label: 'אחר' },
];

const PARTICIPATION_TYPE_OPTIONS = [
  { value: 'participation', label: 'השתתפות' },
  { value: 'management', label: 'ניהול' },
  { value: 'chair', label: 'יו"ר' },
];

const identifiersSchema = z.object({
  committeeName: z.string().optional(),
  subCommitteeName: z.string().optional(),
  participationType: z.enum(['participation', 'management', 'chair']).optional(),
  ministryName: z.string().optional(),
  roleType: z.enum(['party', 'military', 'knesset', 'public', 'other']).optional(),
  field: z.string().optional(),
  district: z.string().optional(),
});

const schema = z.object({
  tickets: z.array(z.string()).min(1, 'נדרש לפחות טיקט אחד'),
  type: z.enum(ATTRIBUTE_TYPE_VALUES),
  score: z.number(),
  description: z.string().optional(),
  identifiers: identifiersSchema,
  vectorNames: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  const { type, identifiers } = data;
  if ((type === 'committee' || type === 'sub_committee') && !identifiers.committeeName) {
    ctx.addIssue({ code: 'custom', path: ['identifiers', 'committeeName'], message: 'שם ועדה נדרש' });
  }
  if (type === 'sub_committee' && !identifiers.subCommitteeName) {
    ctx.addIssue({ code: 'custom', path: ['identifiers', 'subCommitteeName'], message: 'שם תת-ועדה נדרש' });
  }
  if (type === 'government_ministry' && !identifiers.ministryName) {
    ctx.addIssue({ code: 'custom', path: ['identifiers', 'ministryName'], message: 'שם משרד נדרש' });
  }
  if (type === 'role_type' && !identifiers.roleType) {
    ctx.addIssue({ code: 'custom', path: ['identifiers', 'roleType'], message: 'סוג תפקיד נדרש' });
  }
  if (type === 'education_field' && !identifiers.field) {
    ctx.addIssue({ code: 'custom', path: ['identifiers', 'field'], message: 'תחום השכלה נדרש' });
  }
  if (type === 'residence_district' && !identifiers.district) {
    ctx.addIssue({ code: 'custom', path: ['identifiers', 'district'], message: 'מחוז נדרש' });
  }
});

type FormValues = z.infer<typeof schema>;

export default function TicketAttributeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: existing } = useTicketAttribute(id ?? '');
  const { data: tickets } = useTickets();
  const createMutation = useCreateTicketAttribute();
  const updateMutation = useUpdateTicketAttribute(id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tickets: [], type: 'committee', score: 0, description: '', identifiers: {}, vectorNames: [] },
  });

  const selectedType = useWatch({ control, name: 'type' });

  // Derive available vector options from whichever tickets are currently selected
  const selectedTicketIds = useWatch({ control, name: 'tickets' });
  const vectorOptions = useMemo(() => {
    const names = new Set<string>();
    (tickets ?? [])
      .filter((t) => selectedTicketIds.includes(t._id))
      .flatMap((t) => t.vectors)
      .forEach((v) => names.add(v.name));
    return [...names].map((n) => ({ value: n, label: n }));
  }, [tickets, selectedTicketIds]);

  useEffect(() => {
    if (existing) {
      reset({
        tickets: existing.tickets,
        type: existing.type,
        score: existing.score,
        description: existing.description ?? '',
        identifiers: existing.identifiers,
        vectorNames: existing.vectorNames ?? [],
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(values);
        message.success('המאפיין עודכן');
      } else {
        await createMutation.mutateAsync(values);
        message.success('המאפיין נוצר');
      }
      navigate('/ticket-attributes');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(msg ?? 'משהו השתבש');
    }
  };

  const ticketOptions = (tickets ?? []).map((t) => ({ value: t._id, label: t.name }));

  return (
    <div style={{ maxWidth: 700 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Button onClick={() => navigate('/ticket-attributes')}>חזרה</Button>
        <Typography.Title level={4} style={{ margin: 0, color: '#1a1b2e' }}>
          {isEdit ? 'עריכת מאפיין טיקט' : 'מאפיין טיקט חדש'}
        </Typography.Title>
      </div>

      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="טיקטים"
            required
            validateStatus={errors.tickets ? 'error' : ''}
            help={(errors.tickets as { message?: string })?.message}
          >
            <Controller
              name="tickets"
              control={control}
              render={({ field }) => (
                <Select
                  mode="multiple"
                  value={field.value}
                  onChange={field.onChange}
                  options={ticketOptions}
                  placeholder="בחר טיקטים"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="וקטורים"
            help={
              vectorOptions.length === 0
                ? 'בחר טיקטים תחילה כדי לראות את הוקטורים הזמינים'
                : 'הניקוד יצטבר לכל וקטור שנבחר'
            }
          >
            <Controller
              name="vectorNames"
              control={control}
              render={({ field }) => (
                <Select
                  mode="multiple"
                  value={field.value}
                  onChange={field.onChange}
                  options={vectorOptions}
                  placeholder="בחר וקטורים (אופציונלי)"
                  disabled={vectorOptions.length === 0}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="סוג"
            required
            validateStatus={errors.type ? 'error' : ''}
            help={errors.type?.message}
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={ATTRIBUTE_TYPE_OPTIONS}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="ניקוד" required>
            <Controller
              name="score"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} />
              )}
            />
          </Form.Item>

          <Form.Item label="תיאור">
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} />}
            />
          </Form.Item>

          {(selectedType === 'committee' || selectedType === 'sub_committee') && (
            <Form.Item
              label="שם ועדה"
              required
              validateStatus={(errors.identifiers as { committeeName?: { message?: string } })?.committeeName ? 'error' : ''}
              help={(errors.identifiers as { committeeName?: { message?: string } })?.committeeName?.message}
            >
              <Controller
                name="identifiers.committeeName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          )}

          {(selectedType === 'committee' || selectedType === 'sub_committee') && (
            <Form.Item label="סוג השתתפות">
              <Controller
                name="identifiers.participationType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={PARTICIPATION_TYPE_OPTIONS}
                    placeholder="כל סוגי ההשתתפות"
                    allowClear
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Form.Item>
          )}

          {selectedType === 'sub_committee' && (
            <Form.Item
              label="שם תת-ועדה"
              required
              validateStatus={(errors.identifiers as { subCommitteeName?: { message?: string } })?.subCommitteeName ? 'error' : ''}
              help={(errors.identifiers as { subCommitteeName?: { message?: string } })?.subCommitteeName?.message}
            >
              <Controller
                name="identifiers.subCommitteeName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          )}

          {selectedType === 'government_ministry' && (
            <Form.Item
              label="שם משרד"
              required
              validateStatus={(errors.identifiers as { ministryName?: { message?: string } })?.ministryName ? 'error' : ''}
              help={(errors.identifiers as { ministryName?: { message?: string } })?.ministryName?.message}
            >
              <Controller
                name="identifiers.ministryName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          )}

          {selectedType === 'role_type' && (
            <Form.Item
              label="סוג תפקיד"
              required
              validateStatus={(errors.identifiers as { roleType?: { message?: string } })?.roleType ? 'error' : ''}
              help={(errors.identifiers as { roleType?: { message?: string } })?.roleType?.message}
            >
              <Controller
                name="identifiers.roleType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onChange={field.onChange} options={ROLE_TYPE_OPTIONS} style={{ width: '100%' }} />
                )}
              />
            </Form.Item>
          )}

          {selectedType === 'education_field' && (
            <Form.Item
              label="תחום השכלה"
              required
              validateStatus={(errors.identifiers as { field?: { message?: string } })?.field ? 'error' : ''}
              help={(errors.identifiers as { field?: { message?: string } })?.field?.message}
            >
              <Controller
                name="identifiers.field"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          )}

          {selectedType === 'residence_district' && (
            <Form.Item
              label="מחוז מגורים"
              required
              validateStatus={(errors.identifiers as { district?: { message?: string } })?.district ? 'error' : ''}
              help={(errors.identifiers as { district?: { message?: string } })?.district?.message}
            >
              <Controller
                name="identifiers.district"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEdit ? 'שמור שינויים' : 'צור מאפיין'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
