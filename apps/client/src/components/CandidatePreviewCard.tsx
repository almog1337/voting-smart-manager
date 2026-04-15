import { Button, Card, Descriptions, Tag } from 'antd';
import type { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  onClose: () => void;
}

const ORIENTATION_COLOR: Record<string, string> = {
  right: 'blue',
  left: 'red',
  center: 'orange',
};

const ORIENTATION_LABEL: Record<string, string> = {
  right: 'ימין',
  left: 'שמאל',
  center: 'מרכז',
};

export default function CandidatePreviewCard({ candidate, onClose }: Props) {
  return (
    <Card
      title={`תצוגה מקדימה: ${candidate.name}`}
      extra={<Button onClick={onClose}>סגור</Button>}
      style={{
        marginTop: 24,
        background: '#f8f9fa',
        borderColor: '#e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
      }}
      headStyle={{ background: '#f1f3f5', borderBottom: '1px solid #e5e7eb', color: '#1a1b2e' }}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="שם">{candidate.name}</Descriptions.Item>
        <Descriptions.Item label="מגדר">{candidate.gender ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="מגזר">{candidate.sector ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="נטייה פוליטית">
          {candidate.orientation ? (
            <Tag color={ORIENTATION_COLOR[candidate.orientation]}>
              {ORIENTATION_LABEL[candidate.orientation] ?? candidate.orientation}
            </Tag>
          ) : (
            '—'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="מכהן כרגע">
          <Tag color={candidate.isCurrentlyServing ? 'success' : 'default'}>
            {candidate.isCurrentlyServing ? 'כן' : 'לא'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="שנת לידה">{candidate.birthYear ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="גיל (חישוב)">
          {candidate.age != null ? <Tag color="purple">{candidate.age}</Tag> : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="נבחר לראשונה (חישוב)">
          {candidate.firstElected != null ? (
            <Tag color="geekblue">{candidate.firstElected}</Tag>
          ) : (
            '—'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="ותק (חישוב)">
          {candidate.seniorityDuration != null ? (
            <Tag color="cyan">{candidate.seniorityDuration} שנים</Tag>
          ) : (
            '—'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="מפלגה נוכחית (חישוב)">
          {candidate.currentParty ? (
            <Tag color="gold">{candidate.currentParty.title}</Tag>
          ) : (
            '—'
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
