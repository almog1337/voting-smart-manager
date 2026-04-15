import { Button, Card, Descriptions, Result, Space, Spin, Table, Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicket } from '../hooks/useTickets';
import type { Vector } from '../types';

const ORIENTATION_COLOR: Record<string, string> = { right: 'blue', left: 'red' };
const ORIENTATION_LABEL: Record<string, string> = { right: 'ימין', left: 'שמאל' };

export default function TicketViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError } = useTicket(id!);

  if (isLoading) return <Spin style={{ display: 'block', marginTop: 80 }} />;
  if (isError) return <Result status="error" title="שגיאת חיבור" subTitle="לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שנית." />;
  if (!ticket) return <Result status="404" title="טיקט לא נמצא" />;

  const vectorColumns = [
    { title: 'שם', dataIndex: 'name', key: 'name' },
    {
      title: 'נטייה',
      dataIndex: 'orientation',
      key: 'orientation',
      render: (v: string) => (
        <Tag color={ORIENTATION_COLOR[v] ?? 'default'}>{ORIENTATION_LABEL[v] ?? v}</Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/tickets')} />
        <Typography.Title level={4} style={{ margin: 0 }}>{ticket.name}</Typography.Title>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card title="פרטי טיקט">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="שם">{ticket.name}</Descriptions.Item>
            <Descriptions.Item label="סף חסימה">{ticket.threshold ?? '—'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <span>וקטורים</span>
              <Tag color="blue">{ticket.vectors?.length ?? 0}</Tag>
            </Space>
          }
        >
          {ticket.vectors?.length ? (
            <Table
              dataSource={ticket.vectors}
              rowKey={(_: Vector, i) => String(i)}
              columns={vectorColumns}
              pagination={false}
              size="small"
            />
          ) : (
            <Typography.Text type="secondary">אין וקטורים</Typography.Text>
          )}
        </Card>
      </Space>
    </div>
  );
}
