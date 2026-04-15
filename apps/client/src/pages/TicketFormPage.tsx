import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Form, Input, InputNumber, Select, Space, Typography, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCreateTicket, useTicket, useUpdateTicket } from '../hooks/useTickets';

const vectorSchema = z.object({
  name: z.string().min(1, 'שם נדרש'),
  orientation: z.enum(['right', 'left']),
});

const schema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  threshold: z.number().default(0),
  vectors: z.array(vectorSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

export default function TicketFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: existing } = useTicket(id ?? '');
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket(id ?? '');

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', threshold: 0, vectors: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'vectors' });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        threshold: existing.threshold,
        vectors: existing.vectors.map((v) => ({ name: v.name, orientation: v.orientation })),
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(values);
        message.success('הטיקט עודכן');
      } else {
        await createMutation.mutateAsync(values);
        message.success('הטיקט נוצר');
      }
      navigate('/tickets');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(msg ?? 'משהו השתבש');
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Button onClick={() => navigate('/tickets')}>חזרה</Button>
        <Typography.Title level={4} style={{ margin: 0, color: '#1a1b2e' }}>
          {isEdit ? 'עריכת טיקט' : 'טיקט חדש'}
        </Typography.Title>
      </div>

      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="שם" required validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
            <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>

          <Form.Item label="סף">
            <Controller name="threshold" control={control} render={({ field }) => (
              <InputNumber {...field} min={0} style={{ width: '100%' }} />
            )} />
          </Form.Item>

          <Typography.Text strong>וקטורים</Typography.Text>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            {fields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                style={{ marginBottom: 8 }}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(index)}
                  />
                }
              >
                <Space style={{ width: '100%' }} direction="vertical">
                  <Form.Item
                    label="שם"
                    style={{ marginBottom: 0 }}
                    validateStatus={errors.vectors?.[index]?.name ? 'error' : ''}
                    help={errors.vectors?.[index]?.name?.message}
                  >
                    <Controller
                      name={`vectors.${index}.name`}
                      control={control}
                      render={({ field: f }) => <Input {...f} placeholder="שם הוקטור" />}
                    />
                  </Form.Item>
                  <Form.Item label="נטייה" style={{ marginBottom: 0 }}>
                    <Controller
                      name={`vectors.${index}.orientation`}
                      control={control}
                      render={({ field: f }) => (
                        <Select
                          value={f.value}
                          onChange={f.onChange}
                          options={[
                            { value: 'right', label: 'ימין' },
                            { value: 'left', label: 'שמאל' },
                          ]}
                          style={{ width: '100%' }}
                        />
                      )}
                    />
                  </Form.Item>
                </Space>
              </Card>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => append({ name: '', orientation: 'right' })}
            >
              הוסף וקטור
            </Button>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEdit ? 'שמור שינויים' : 'צור טיקט'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
