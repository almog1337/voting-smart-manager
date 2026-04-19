import { Alert, Button, Card, Descriptions, List, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useRunScoringJob } from '../hooks/useScoringJobs';
import type { ScoringJobResult } from '../api/scoringJobs';

export default function SettingsPage() {
  const { mutate, isPending, data, error, isSuccess } = useRunScoringJob();

  const result = data as ScoringJobResult | undefined;

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 24 }}>
        הגדרות
      </Typography.Title>

      <Card
        title="מנוע חישוב טיקטים"
        style={{ maxWidth: 600 }}
        styles={{ body: { display: 'flex', flexDirection: 'column', gap: 16 } }}
      >
        <Typography.Text type="secondary">
          מריץ את חישוב הטיקטים על כל המועמדים ומעדכן את השתייכויות הטיקטים שלהם.
        </Typography.Text>

        <div>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={isPending}
            onClick={() => mutate()}
          >
            {isPending ? 'מריץ...' : 'הרץ חישוב טיקטים'}
          </Button>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            message="שגיאה בהרצת חישוב הטיקטים"
            description={(error as Error).message}
          />
        )}

        {isSuccess && result && (
          <>
            <Alert
              type={result.errors.length > 0 ? 'warning' : 'success'}
              showIcon
              message="חישוב הטיקטים השולם"
            />
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="מועמדים שעובדו">
                {result.candidatesProcessed}
              </Descriptions.Item>
              <Descriptions.Item label="מועמדים שעודכנו">
                {result.candidatesUpdated}
              </Descriptions.Item>
              <Descriptions.Item label="משך ריצה">
                {result.durationMs.toLocaleString()} ms
              </Descriptions.Item>
              <Descriptions.Item label="זמן הרצה">
                {new Date(result.processedAt).toLocaleTimeString('he-IL')}
              </Descriptions.Item>
            </Descriptions>

            {result.errors.length > 0 && (
              <div>
                <Typography.Text type="danger" strong>
                  שגיאות ({result.errors.length}):
                </Typography.Text>
                <List
                  size="small"
                  style={{ marginTop: 8 }}
                  dataSource={result.errors}
                  renderItem={(e) => (
                    <List.Item>
                      <Typography.Text code>{e.candidateId}</Typography.Text>
                      <Typography.Text type="secondary" style={{ marginRight: 8 }}>
                        {e.message}
                      </Typography.Text>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
