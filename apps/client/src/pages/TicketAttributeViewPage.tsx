import { Button, Card, Descriptions, Result, Space, Spin, Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicketAttribute } from '../hooks/useTicketAttributes';
import { useTickets } from '../hooks/useTickets';

const TYPE_LABELS: Record<string, string> = {
  committee: 'ועדה',
  sub_committee: 'תת-ועדה',
  government_ministry: 'משרד ממשלתי',
  role_type: 'סוג תפקיד',
  education_field: 'תחום השכלה',
  residence_district: 'מחוז מגורים',
};

const IDENTIFIER_LABELS: Record<string, string> = {
  committeeName: 'שם ועדה',
  subCommitteeName: 'שם תת-ועדה',
  participationType: 'סוג השתתפות',
  ministryName: 'שם משרד',
  roleType: 'סוג תפקיד',
  field: 'תחום השכלה',
  district: 'מחוז',
};

const ROLE_TYPE_LABELS: Record<string, string> = {
  party: 'מפלגה',
  military: 'צבאי',
  knesset: 'כנסת',
  public: 'ציבורי',
  other: 'אחר',
};

const PARTICIPATION_TYPE_LABELS: Record<string, string> = {
  participation: 'השתתפות',
  management: 'ניהול',
  chair: 'יו"ר',
};

export default function TicketAttributeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: attr, isLoading, isError } = useTicketAttribute(id!);
  const { data: allTickets } = useTickets();

  if (isLoading) return <Spin style={{ display: 'block', marginTop: 80 }} />;
  if (isError) return <Result status="error" title="שגיאת חיבור" subTitle="לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שנית." />;
  if (!attr) return <Result status="404" title="מאפיין לא נמצא" />;

  const linkedTickets = allTickets?.filter(t => attr.tickets.includes(t._id)) ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/ticket-attributes')} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          <Tag style={{ marginLeft: 8, fontSize: 14 }}>{TYPE_LABELS[attr.type] ?? attr.type}</Tag>
          מאפיין טיקט
        </Typography.Title>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card title="פרטי מאפיין">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="סוג">
              <Tag>{TYPE_LABELS[attr.type] ?? attr.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="ניקוד">{attr.score}</Descriptions.Item>
            <Descriptions.Item label="וקטורים" span={2}>
              {attr.vectorNames?.length
                ? attr.vectorNames.map((n) => <Tag key={n}>{n}</Tag>)
                : <Typography.Text type="secondary">—</Typography.Text>}
            </Descriptions.Item>
            <Descriptions.Item label="תיאור" span={2}>{attr.description ?? '—'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="מזהים">
          <Descriptions column={2} bordered size="small">
            {(Object.entries(attr.identifiers) as [string, string | undefined][])
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => (
                <Descriptions.Item key={k} label={IDENTIFIER_LABELS[k] ?? k}>
                  {k === 'roleType'
                    ? (ROLE_TYPE_LABELS[v!] ?? v)
                    : k === 'participationType'
                    ? (PARTICIPATION_TYPE_LABELS[v!] ?? v)
                    : v}
                </Descriptions.Item>
              ))}
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <span>טיקטים משויכים</span>
              <Tag color="blue">{linkedTickets.length}</Tag>
            </Space>
          }
        >
          {linkedTickets.length ? (
            <Space wrap>
              {linkedTickets.map(t => (
                <Button
                  key={t._id}
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => navigate(`/tickets/${t._id}`)}
                >
                  {t.name}
                </Button>
              ))}
            </Space>
          ) : (
            <Typography.Text type="secondary">אין טיקטים משויכים</Typography.Text>
          )}
        </Card>
      </Space>
    </div>
  );
}
