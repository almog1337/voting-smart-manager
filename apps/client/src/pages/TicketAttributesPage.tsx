import { Alert, Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDeleteTicketAttribute, useTicketAttributes } from '../hooks/useTicketAttributes';
import type { TicketAttribute } from '../types';

const TYPE_LABELS: Record<string, string> = {
  committee: 'ועדה',
  sub_committee: 'תת-ועדה',
  government_ministry: 'משרד ממשלתי',
  role_type: 'סוג תפקיד',
  education_field: 'תחום השכלה',
  residence_district: 'מחוז מגורים',
};

const IDENTIFIER_LABELS: Record<string, string> = {
  committeeName: 'ועדה',
  subCommitteeName: 'תת-ועדה',
  participationType: 'סוג השתתפות',
  ministryName: 'משרד',
  roleType: 'סוג תפקיד',
  field: 'תחום',
  district: 'מחוז',
};

const IDENTIFIER_VALUE_LABELS: Record<string, Record<string, string>> = {
  participationType: { participation: 'השתתפות', management: 'ניהול', chair: 'יו"ר' },
  roleType: { party: 'מפלגתי', military: 'צבאי', knesset: 'כנסת', public: 'ציבורי', other: 'אחר' },
};

export default function TicketAttributesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTicketAttributes();
  const deleteMutation = useDeleteTicketAttribute();

  const columns = [
    {
      title: 'סוג',
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Tag>{TYPE_LABELS[v] ?? v}</Tag>,
    },
    { title: 'ניקוד', dataIndex: 'score', key: 'score' },
    {
      title: 'טיקטים',
      dataIndex: 'tickets',
      key: 'tickets',
      render: (tickets: string[]) => tickets.length,
    },
    {
      title: 'מזהים',
      key: 'identifiers',
      render: (_: unknown, record: TicketAttribute) => (
        <Space wrap>
          {Object.entries(record.identifiers)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => {
              const label = IDENTIFIER_LABELS[k] ?? k;
              const value = IDENTIFIER_VALUE_LABELS[k]?.[v as string] ?? v;
              return (
                <Tag key={k}>
                  {label}: {value}
                </Tag>
              );
            })}
        </Space>
      ),
    },
    {
      title: 'תיאור',
      dataIndex: 'description',
      key: 'description',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_: unknown, record: TicketAttribute) => (
        <Space>
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => navigate(`/ticket-attributes/${record._id}`)}
          >
            צפייה
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/ticket-attributes/${record._id}/edit`)}
          >
            עריכה
          </Button>
          <Popconfirm
            title="למחוק את המאפיין?"
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
          מאפייני טיקטים
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/ticket-attributes/new')}
        >
          מאפיין חדש
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
