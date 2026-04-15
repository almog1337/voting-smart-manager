import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Form, Input, Switch, Typography, App } from 'antd';
import { useCreateParty, useParty, useUpdateParty } from '../hooks/useParties';

const schema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  platform: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function PartyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: existing } = useParty(id ?? '');
  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty(id ?? '');

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', platform: '', isActive: true },
  });

  useEffect(() => {
    if (existing) {
      reset({ name: existing.name, platform: existing.platform ?? '', isActive: existing.isActive });
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(values);
        message.success('המפלגה עודכנה');
      } else {
        await createMutation.mutateAsync(values);
        message.success('המפלגה נוצרה');
      }
      navigate('/parties');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(msg ?? 'משהו השתבש');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
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
        <Button onClick={() => navigate('/parties')}>חזרה</Button>
        <Typography.Title level={4} style={{ margin: 0, color: '#1a1b2e' }}>
          {isEdit ? 'עריכת מפלגה' : 'מפלגה חדשה'}
        </Typography.Title>
      </div>

      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="שם" required validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
            <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>

          <Form.Item label="פלטפורמה" validateStatus={errors.platform ? 'error' : ''} help={errors.platform?.message}>
            <Controller name="platform" control={control} render={({ field }) => <Input.TextArea {...field} rows={3} />} />
          </Form.Item>

          <Form.Item label="פעיל">
            <Controller name="isActive" control={control} render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} />
            )} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEdit ? 'שמור שינויים' : 'צור מפלגה'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
