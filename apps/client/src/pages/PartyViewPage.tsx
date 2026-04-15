import { Button, Card, Descriptions, Result, Space, Spin, Table, Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useParty } from '../hooks/useParties';
import type { Candidate } from '../types';

const ORIENTATION_COLOR: Record<string, string> = { right: 'blue', left: 'red', center: 'orange' };
const ORIENTATION_LABEL: Record<string, string> = { right: 'ימין', left: 'שמאל', center: 'מרכז' };

export default function PartyViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: party, isLoading, isError } = useParty(id!);

  if (isLoading) return <Spin style={{ display: 'block', marginTop: 80 }} />;
  if (isError) return <Result status="error" title="שגיאת חיבור" subTitle="לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שנית." />;
  if (!party) return <Result status="404" title="מפלגה לא נמצאה" />;

  const candidateColumns = [
    {
      title: 'שם',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Candidate) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/candidates/${record._id}`)}>
          {name}
        </Button>
      ),
    },
    {
      title: 'נטייה פוליטית',
      dataIndex: 'orientation',
      key: 'orientation',
      render: (v?: string) =>
        v ? (
          <Tag color={ORIENTATION_COLOR[v] ?? 'default'}>{ORIENTATION_LABEL[v] ?? v}</Tag>
        ) : '—',
    },
    {
      title: 'גיל',
      dataIndex: 'age',
      key: 'age',
      render: (v?: number) => (v != null ? <Tag color="purple">{v}</Tag> : '—'),
    },
    {
      title: 'תפקיד נוכחי',
      key: 'currentPartyTitle',
      render: (_: unknown, record: Candidate) =>
        record.currentParty ? (record.currentParty as any).title ?? '—' : '—',
    },
    {
      title: 'נבחר לראשונה',
      dataIndex: 'firstElected',
      key: 'firstElected',
      render: (v?: number) => (v != null ? <Tag color="geekblue">{v}</Tag> : '—'),
    },
    {
      title: 'ותק',
      dataIndex: 'seniorityDuration',
      key: 'seniorityDuration',
      render: (v?: number) => (v != null ? `${v}ש'` : '—'),
    },
    {
      title: 'מכהן',
      dataIndex: 'isCurrentlyServing',
      key: 'isCurrentlyServing',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'כן' : 'לא'}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/parties')} />
        <Typography.Title level={4} style={{ margin: 0 }}>{party.name}</Typography.Title>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card title="פרטי מפלגה">
          <Descriptions column={3} bordered size="small">
            <Descriptions.Item label="שם">{party.name}</Descriptions.Item>
            <Descriptions.Item label="פעיל">
              <Tag color={party.isActive ? 'green' : 'red'}>{party.isActive ? 'כן' : 'לא'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="פלטפורמה" span={3}>
              {party.platform ?? '—'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Candidates virtual populate */}
        <Card
          title={
            <Space>
              <span>מועמדים</span>
              {party.candidates && (
                <Tag color="blue">{party.candidates.length}</Tag>
              )}
            </Space>
          }
        >
          {party.candidates?.length ? (
            <Table
              dataSource={party.candidates}
              rowKey="_id"
              columns={candidateColumns}
              pagination={{ pageSize: 20 }}
              size="small"
              scroll={{ x: 700 }}
            />
          ) : (
            <Typography.Text type="secondary">אין מועמדים משויכים</Typography.Text>
          )}
        </Card>
      </Space>
    </div>
  );
}
