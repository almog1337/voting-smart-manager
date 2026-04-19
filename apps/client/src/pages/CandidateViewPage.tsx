import { Button, Card, Descriptions, Result, Space, Spin, Table, Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useCandidate } from '../hooks/useCandidates';
import type { AnyRole, CandidateTicket, Committee, Education, Image, Link, Residence } from '../types';

const GENDER_LABEL: Record<string, string> = { male: 'זכר', female: 'נקבה', other: 'אחר' };
const SECTOR_LABEL: Record<string, string> = { secular: 'חילוני', religious: 'דתי' };
const ORIENTATION_COLOR: Record<string, string> = { right: 'blue', left: 'red', center: 'orange' };
const ORIENTATION_LABEL: Record<string, string> = { right: 'ימין', left: 'שמאל', center: 'מרכז' };
const ROLE_TYPE_LABEL: Record<string, string> = {
  party: 'מפלגה', military: 'צבאי', knesset: 'כנסת', public: 'ציבורי', other: 'אחר',
};
const LINK_TYPE_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn', wikipedia: 'ויקיפדיה', knesset: 'אתר הכנסת', other: 'אחר',
};

export default function CandidateViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: candidate, isLoading, isError } = useCandidate(id!);

  if (isLoading) return <Spin style={{ display: 'block', marginTop: 80 }} />;
  if (isError) return <Result status="error" title="שגיאת חיבור" subTitle="לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט ונסה שנית." />;
  if (!candidate) return <Result status="404" title="מועמד לא נמצא" />;

  const roleColumns = [
    { title: 'סוג', dataIndex: 'roleType', key: 'roleType', render: (v: string) => ROLE_TYPE_LABEL[v] ?? v },
    { title: 'תפקיד', dataIndex: 'title', key: 'title' },
    {
      title: 'פרטים',
      key: 'details',
      render: (_: unknown, r: AnyRole) => {
        if (r.roleType === 'party') return `עמדה ${(r as any).listPosition ?? '—'}`;
        if (r.roleType === 'military') return [(r as any).rank, (r as any).unit].filter(Boolean).join(' / ');
        if (r.roleType === 'knesset') return `כנסת ${(r as any).knessetNum ?? '—'}`;
        if (r.roleType === 'public') return (r as any).ministry ?? '—';
        return '—';
      },
    },
    { title: 'מתאריך', dataIndex: 'startDate', key: 'startDate', render: (v?: string) => v ?? '—' },
    { title: 'עד תאריך', dataIndex: 'endDate', key: 'endDate', render: (v?: string) => v ?? '—' },
    {
      title: 'פעיל',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'כן' : 'לא'}</Tag>,
    },
  ];

  const educationColumns = [
    { title: 'תואר', dataIndex: 'degree', key: 'degree', render: (v?: string) => v ?? '—' },
    { title: 'תחום', dataIndex: 'field', key: 'field', render: (v?: string) => v ?? '—' },
    { title: 'מוסד', dataIndex: 'institution', key: 'institution', render: (v?: string) => v ?? '—' },
    { title: 'הכשרה', dataIndex: 'training', key: 'training', render: (v?: string) => v ?? '—' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/candidates')} />
        <Typography.Title level={4} style={{ margin: 0 }}>{candidate.name}</Typography.Title>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Basic info */}
        <Card title="פרטים כלליים">
          <Descriptions column={3} bordered size="small">
            <Descriptions.Item label="שם">{candidate.name}</Descriptions.Item>
            <Descriptions.Item label="שנת לידה">{candidate.birthYear ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="גיל">
              {candidate.age != null ? <Tag color="purple">{candidate.age}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="מגדר">{candidate.gender ? GENDER_LABEL[candidate.gender] ?? candidate.gender : '—'}</Descriptions.Item>
            <Descriptions.Item label="מגזר">{candidate.sector ? SECTOR_LABEL[candidate.sector] ?? candidate.sector : '—'}</Descriptions.Item>
            <Descriptions.Item label="נטייה פוליטית">
              {candidate.orientation ? (
                <Tag color={ORIENTATION_COLOR[candidate.orientation] ?? 'default'}>
                  {ORIENTATION_LABEL[candidate.orientation] ?? candidate.orientation}
                </Tag>
              ) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="שפות">
              {candidate.languages?.length ? (
                <Space wrap>{candidate.languages.map(l => <Tag key={l}>{l}</Tag>)}</Space>
              ) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="מכהן כיום">
              <Tag color={candidate.isCurrentlyServing ? 'green' : 'default'}>
                {candidate.isCurrentlyServing ? 'כן' : 'לא'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Virtuals */}
        <Card title="שדות מחושבים" style={{ background: '#f8f9fa' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Descriptions column={4} bordered size="small">
              <Descriptions.Item label="גיל">
                {candidate.age != null ? <Tag color="purple">{candidate.age}</Tag> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="מפלגה נוכחית">
                {candidate.currentParty ? (
                  <Tag color="blue">{(candidate.currentParty as any).title ?? '—'}</Tag>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="נבחר לראשונה">
                {candidate.firstElected != null ? <Tag color="geekblue">{candidate.firstElected}</Tag> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="ותק (שנים)">
                {candidate.seniorityDuration != null ? `${candidate.seniorityDuration}ש'` : '—'}
              </Descriptions.Item>
            </Descriptions>
            {candidate.tickets?.length > 0 && (
              <Card title="טיקטים" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {candidate.tickets.map((t: CandidateTicket, i: number) => (
                    <Card key={i} size="small" type="inner" title={
                      <Space>
                        <span>{t.ticketName}</span>
                        {t.isPrimary && <Tag color="gold">ראשי</Tag>}
                      </Space>
                    }>
                      {t.vectors?.length > 0 ? (
                        <Space wrap>
                          {t.vectors.map((v, j) => (
                            <Tag key={j} color="purple">{v.vectorName}: {v.score}</Tag>
                          ))}
                        </Space>
                      ) : <Typography.Text type="secondary">אין וקטורים</Typography.Text>}
                    </Card>
                  ))}
                </Space>
              </Card>
            )}
          </Space>
        </Card>

        {/* Residence */}
        {candidate.residence?.length > 0 && (
          <Card title="מגורים">
            <Descriptions column={4} bordered size="small">
              {candidate.residence.map((r: Residence, i: number) => (
                <>
                  <Descriptions.Item key={`city-${i}`} label="עיר">{r.city}</Descriptions.Item>
                  <Descriptions.Item key={`district-${i}`} label="מחוז">{r.district ?? '—'}</Descriptions.Item>
                  <Descriptions.Item key={`periphery-${i}`} label="פריפריה">{r.geographicPeriphery ?? '—'}</Descriptions.Item>
                  <Descriptions.Item key={`birth-${i}`} label="ארץ לידה">{r.birthCountry ?? '—'}</Descriptions.Item>
                </>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* Education */}
        {candidate.education?.length > 0 && (
          <Card title="השכלה">
            <Table
              dataSource={candidate.education}
              rowKey={(_: Education, i) => String(i)}
              columns={educationColumns}
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Roles */}
        {candidate.roles?.length > 0 && (
          <Card title="תפקידים">
            <Table
              dataSource={candidate.roles}
              rowKey={(_: AnyRole, i) => String(i)}
              columns={roleColumns}
              pagination={false}
              size="small"
              scroll={{ x: 700 }}
            />
          </Card>
        )}

        {/* Committees */}
        {candidate.committees?.length > 0 && (
          <Card title="ועדות">
            <Space wrap>
              {candidate.committees.map((c: Committee, i: number) => (
                <Tag key={i} color="cyan">{c.committeeName} ({c.participationType})</Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* Links */}
        {candidate.links?.length > 0 && (
          <Card title="קישורים">
            <Space wrap>
              {candidate.links.map((l: Link, i: number) => (
                <Button key={i} type="link" href={l.url} target="_blank" rel="noopener noreferrer">
                  {LINK_TYPE_LABEL[l.linkType] ?? l.linkType}
                </Button>
              ))}
            </Space>
          </Card>
        )}

        {/* Images */}
        {candidate.images?.length > 0 && (
          <Card title="תמונות">
            <Space wrap>
              {candidate.images.map((img: Image, i: number) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <img src={img.url} alt={img.imageType} style={{ height: 80, objectFit: 'cover', borderRadius: 4 }} />
                  <div><Tag style={{ marginTop: 4 }}>{img.imageType}</Tag></div>
                </div>
              ))}
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
}
