import { Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDeleteParty, useParties } from '../hooks/useParties';
import type { Party } from '../types';

export default function PartiesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useParties();
  const deleteMutation = useDeleteParty();

  const columns = [
    { title: 'שם', dataIndex: 'name', key: 'name' },
    {
      title: 'פלטפורמה',
      dataIndex: 'platform',
      key: 'platform',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'פעיל',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'red'}>{v ? 'כן' : 'לא'}</Tag>
      ),
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_: unknown, record: Party) => (
        <Space>
          <Button size="small" type="primary" ghost onClick={() => navigate(`/parties/${record._id}`)}>
            צפייה
          </Button>
          <Button size="small" onClick={() => navigate(`/parties/${record._id}/edit`)}>
            עריכה
          </Button>
          <Popconfirm
            title="למחוק את המפלגה?"
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
          מפלגות
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/parties/new')}>
          מפלגה חדשה
        </Button>
      </div>
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
