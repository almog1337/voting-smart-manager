import { Alert, Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCandidates, useDeleteCandidate } from '../hooks/useCandidates';
import type { Candidate } from '../types';

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

export default function CandidatesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCandidates();
  const deleteMutation = useDeleteCandidate();

  const columns = [
    { title: 'שם', dataIndex: 'name', key: 'name' },
    {
      title: 'שנת לידה',
      dataIndex: 'birthYear',
      key: 'birthYear',
      render: (v?: number) => v ?? '—',
    },
    {
      title: 'גיל',
      dataIndex: 'age',
      key: 'age',
      render: (v?: number) => (v != null ? <Tag color="purple">{v}</Tag> : '—'),
    },
    {
      title: 'מגדר',
      dataIndex: 'gender',
      key: 'gender',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'נטייה פוליטית',
      dataIndex: 'orientation',
      key: 'orientation',
      render: (v?: string) =>
        v ? (
          <Tag color={ORIENTATION_COLOR[v] ?? 'default'}>
            {ORIENTATION_LABEL[v] ?? v}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      title: 'מכהן',
      dataIndex: 'isCurrentlyServing',
      key: 'isCurrentlyServing',
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? 'כן' : 'לא'}</Tag>
      ),
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
      title: 'פעולות',
      key: 'actions',
      render: (_: unknown, record: Candidate) => (
        <Space>
          <Button size="small" type="primary" ghost onClick={() => navigate(`/candidates/${record._id}`)}>
            צפייה
          </Button>
          <Button size="small" onClick={() => navigate(`/candidates/${record._id}/edit`)}>
            עריכה
          </Button>
          <Popconfirm
            title="למחוק את המועמד?"
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
          מועמדים
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/candidates/new')}
        >
          מועמד חדש
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
        scroll={{ x: 900 }}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
