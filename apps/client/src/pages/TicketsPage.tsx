import { Alert, Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDeleteTicket, useTickets } from '../hooks/useTickets';
import type { Ticket } from '../types';

const ORIENTATION_LABEL: Record<string, string> = {
  right: 'ימין',
  left: 'שמאל',
};

export default function TicketsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTickets();
  const deleteMutation = useDeleteTicket();

  const columns = [
    { title: 'שם', dataIndex: 'name', key: 'name' },
    { title: 'סף', dataIndex: 'threshold', key: 'threshold' },
    {
      title: 'וקטורים',
      key: 'vectors',
      render: (_: unknown, record: Ticket) => (
        <Space wrap>
          {record.vectors.map((v, i) => (
            <Tag key={i} color={v.orientation === 'right' ? 'blue' : 'red'}>
              {v.name} ({ORIENTATION_LABEL[v.orientation] ?? v.orientation})
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_: unknown, record: Ticket) => (
        <Space>
          <Button size="small" type="primary" ghost onClick={() => navigate(`/tickets/${record._id}`)}>
            צפייה
          </Button>
          <Button size="small" onClick={() => navigate(`/tickets/${record._id}/edit`)}>
            עריכה
          </Button>
          <Popconfirm
            title="למחוק את הטיקט?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="כן"
            cancelText="לא"
          >
            <Button size="small" danger loading={deleteMutation.isPending}>
              מחיקה
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          טיקטים
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tickets/new')}>
          טיקט חדש
        </Button>
      </div>
      {isError && (
        <Alert
          type="error"
          message="שגיאת חיבור"
          description="לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שנית."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Table
        dataSource={data}
        rowKey="_id"
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
