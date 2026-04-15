import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  useCreateTicketAttribute,
  useTicketAttribute,
  useUpdateTicketAttribute,
} from '../hooks/useTicketAttributes';
import { useTickets } from '../hooks/useTickets';

const ATTRIBUTE_TYPE_VALUES = [
  'committee',
  'sub_committee',
  'government_ministry',
  'role_type',
  'education_field',
  'residence_district',
] as const;

const ATTRIBUTE_TYPE_OPTIONS = [
  { value: 'committee', label: 'ועדה' },
  { value: 'sub_committee', label: 'תת-ועדה' },
  { value: 'government_ministry', label: 'משרד ממשלתי' },
  { value: 'role_type', label: 'סוג תפקיד' },
  { value: 'education_field', label: 'תחום השכלה' },
  { value: 'residence_district', label: 'מחוז מגורים' },
];

const schema = z.object({
  tickets: z.array(z.string()).min(1, 'נדרש לפחות טיקט אחד'),
  type: z.enum(ATTRIBUTE_TYPE_VALUES),
  score: z.number(),
  description: z.string().optional(),
  identifiers: z.array(z.object({ key: z.string().min(1), value: z.string() })).default([]),
});

type FormValues = z.infer<typeof schema>;

export default function TicketAttributeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: existing } = useTicketAttribute(id ?? '');
  const { data: tickets } = useTickets();
  const createMutation = useCreateTicketAttribute();
  const updateMutation = useUpdateTicketAttribute(id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tickets: [], type: 'committee', score: 0, description: '', identifiers: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'identifiers' });

  useEffect(() => {
    if (existing) {
      reset({
        tickets: existing.tickets,
        type: existing.type,
        score: existing.score,
        description: existing.description ?? '',
        identifiers: Object.entries(existing.identifiers).map(([key, value]) => ({ key, value })),
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    const { identifiers, ...rest } = values;
    const payload = {
      ...rest,
      identifiers: Object.fromEntries(identifiers.map((i) => [i.key, i.value])),
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        message.success('המאפיין עודכן');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('המאפיין נוצר');
      }
      navigate('/ticket-attributes');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(msg ?? 'משהו השתבש');
    }
  };

  const ticketOptions = (tickets ?? []).map((t) => ({ value: t._id, label: t.name }));

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
        <Button onClick={() => navigate('/ticket-attributes')}>חזרה</Button>
        <Typography.Title level={4} style={{ margin: 0, color: '#1a1b2e' }}>
          {isEdit ? 'עריכת מאפיין טיקט' : 'מאפיין טיקט חדש'}
        </Typography.Title>
      </div>

      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="טיקטים"
            required
            validateStatus={errors.tickets ? 'error' : ''}
            help={(errors.tickets as { message?: string })?.message}
          >
            <Controller
              name="tickets"
              control={control}
              render={({ field }) => (
                <Select
                  mode="multiple"
                  value={field.value}
                  onChange={field.onChange}
                  options={ticketOptions}
                  placeholder="בחר טיקטים"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="סוג"
            required
            validateStatus={errors.type ? 'error' : ''}
            help={errors.type?.message}
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={ATTRIBUTE_TYPE_OPTIONS}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="ניקוד" required>
            <Controller
              name="score"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} style={{ width: '100%' }} />
              )}
            />
          </Form.Item>

          <Form.Item label="תיאור">
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} />}
            />
          </Form.Item>

          <Typography.Text strong>מזהים</Typography.Text>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            {fields.map((field, index) => (
              <Space key={field.id} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Controller
                  name={`identifiers.${index}.key`}
                  control={control}
                  render={({ field: f }) => (
                    <Input {...f} placeholder="מפתח" style={{ width: 200 }} />
                  )}
                />
                <Controller
                  name={`identifiers.${index}.value`}
                  control={control}
                  render={({ field: f }) => (
                    <Input {...f} placeholder="ערך" style={{ width: 200 }} />
                  )}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(index)}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => append({ key: '', value: '' })}
            >
              הוסף מזהה
            </Button>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEdit ? 'שמור שינויים' : 'צור מאפיין'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
