import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  App,
  Button,
  Card,
  Collapse,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useCandidate, useCreateCandidate, useUpdateCandidate } from '../hooks/useCandidates';
import { useParties } from '../hooks/useParties';
import RoleFieldArray from '../components/RoleFieldArray';
import CandidatePreviewCard from '../components/CandidatePreviewCard';
import type { Candidate } from '../types';

// --------------- Zod schema ---------------
const roleBase = z.object({
  title: z.string().min(1, 'כותרת נדרשת'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(false),
});

const roleSchema = z.discriminatedUnion('roleType', [
  roleBase.extend({ roleType: z.literal('party'), partyId: z.string().min(1), listPosition: z.number().optional() }),
  roleBase.extend({ roleType: z.literal('military'), rank: z.string().optional(), unit: z.string().optional() }),
  roleBase.extend({ roleType: z.literal('knesset'), knessetNum: z.number().optional() }),
  roleBase.extend({ roleType: z.literal('public'), ministry: z.string().optional() }),
  roleBase.extend({ roleType: z.literal('other') }),
]);

const schema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  birthYear: z.number().min(1900).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  sector: z.enum(['secular', 'religious']).optional(),
  orientation: z.enum(['right', 'left', 'center']).optional(),
  languages: z.array(z.string()).default([]),
  isCurrentlyServing: z.boolean().default(false),
  residence: z.array(z.object({
    city: z.string().min(1),
    district: z.string().optional(),
    geographicPeriphery: z.number().optional(),
    birthCountry: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).default([]),
  education: z.array(z.object({
    training: z.string().optional(),
    degree: z.string().optional(),
    field: z.string().optional(),
    institution: z.string().optional(),
  })).default([]),
  roles: z.array(roleSchema).default([]),
  links: z.array(z.object({
    linkType: z.enum(['linkedin', 'wikipedia', 'knesset', 'other']),
    url: z.string().url('כתובת URL לא תקינה'),
  })).default([]),
  committees: z.array(z.object({
    participationType: z.enum(['participation', 'management', 'chair']),
    committeeId: z.string().optional(),
    committeeName: z.string().min(1),
  })).default([]),
  images: z.array(z.object({
    imageType: z.enum(['primary', 'secondary', 'mobile', 'thumbnail']),
    url: z.string().url('כתובת URL לא תקינה'),
  })).default([]),
});

type FormValues = z.infer<typeof schema>;

function toPayload(values: FormValues) {
  return values;
}

const EDUCATION_LABELS: Record<string, string> = {
  training: 'הכשרה',
  degree: 'תואר',
  field: 'תחום',
  institution: 'מוסד',
};

export default function CandidateFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: existing } = useCandidate(id ?? '');
  const { data: parties = [] } = useParties();
  const createMutation = useCreateCandidate();
  const updateMutation = useUpdateCandidate(id ?? '');

  const [savedCandidate, setSavedCandidate] = useState<Candidate | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      languages: [],
      isCurrentlyServing: false,
      residence: [],
      education: [],
      roles: [],
      links: [],
      committees: [],
      images: [],
    },
  });

  const residence = useFieldArray({ control, name: 'residence' });
  const education = useFieldArray({ control, name: 'education' });
  const links = useFieldArray({ control, name: 'links' });
  const committees = useFieldArray({ control, name: 'committees' });
  const images = useFieldArray({ control, name: 'images' });

  useEffect(() => {
    if (existing) {
      const { age: _a, currentParty: _cp, firstElected: _fe, seniorityDuration: _sd, _id: _id2, ...rest } = existing as Candidate & Record<string, unknown>;
      void _a; void _cp; void _fe; void _sd; void _id2;
      reset(rest as unknown as FormValues);
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = toPayload(values);
      let result: Candidate;
      if (isEdit) {
        result = await updateMutation.mutateAsync(payload);
        message.success('המועמד עודכן');
      } else {
        result = await createMutation.mutateAsync(payload);
        message.success('המועמד נוצר');
      }
      setSavedCandidate(result);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(msg ?? 'משהו השתבש');
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
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
        <Button onClick={() => navigate('/candidates')}>חזרה</Button>
        <Typography.Title level={4} style={{ margin: 0, color: '#1a1b2e' }}>
          {isEdit ? 'עריכת מועמד' : 'מועמד חדש'}
        </Typography.Title>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Collapse defaultActiveKey={['basic']} style={{ marginBottom: 16 }}>
          {/* ---- פרטים בסיסיים ---- */}
          <Collapse.Panel header="פרטים בסיסיים" key="basic">
            <Space wrap style={{ width: '100%' }}>
              <Form.Item
                label="שם"
                required
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
                style={{ minWidth: 240 }}
              >
                <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
              </Form.Item>

              <Form.Item label="שנת לידה" style={{ minWidth: 140 }}>
                <Controller
                  name="birthYear"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? undefined)}
                      min={1900}
                      max={2010}
                      style={{ width: 140 }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="מגדר" style={{ minWidth: 140 }}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      allowClear
                      options={[
                        { value: 'male', label: 'זכר' },
                        { value: 'female', label: 'נקבה' },
                        { value: 'other', label: 'אחר' },
                      ]}
                      style={{ width: 140 }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="מגזר" style={{ minWidth: 140 }}>
                <Controller
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      allowClear
                      options={[
                        { value: 'secular', label: 'חילוני' },
                        { value: 'religious', label: 'דתי' },
                      ]}
                      style={{ width: 140 }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="נטייה פוליטית" style={{ minWidth: 140 }}>
                <Controller
                  name="orientation"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      allowClear
                      options={[
                        { value: 'right', label: 'ימין' },
                        { value: 'left', label: 'שמאל' },
                        { value: 'center', label: 'מרכז' },
                      ]}
                      style={{ width: 140 }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="מכהן כרגע">
                <Controller
                  name="isCurrentlyServing"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )}
                />
              </Form.Item>
            </Space>

            <Form.Item label="שפות">
              <Controller
                name="languages"
                control={control}
                render={({ field }) => (
                  <Select
                    mode="tags"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="הקלד שפה ואשר עם Enter"
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Form.Item>
          </Collapse.Panel>

          {/* ---- תפקידים ---- */}
          <Collapse.Panel header="תפקידים" key="roles" forceRender>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <RoleFieldArray control={control as any} parties={parties} />
          </Collapse.Panel>

          {/* ---- מגורים ---- */}
          <Collapse.Panel header="מגורים" key="residence" forceRender>
            {residence.fields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                style={{ marginBottom: 8 }}
                extra={
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => residence.remove(index)} />
                }
              >
                <Space wrap>
                  <Form.Item label="עיר" required style={{ marginBottom: 8 }}>
                    <Controller name={`residence.${index}.city`} control={control} render={({ field: f }) => <Input {...f} style={{ width: 160 }} />} />
                  </Form.Item>
                  <Form.Item label="מחוז" style={{ marginBottom: 8 }}>
                    <Controller name={`residence.${index}.district`} control={control} render={({ field: f }) => <Input {...f} style={{ width: 160 }} />} />
                  </Form.Item>
                  <Form.Item label="ארץ לידה" style={{ marginBottom: 8 }}>
                    <Controller name={`residence.${index}.birthCountry`} control={control} render={({ field: f }) => <Input {...f} style={{ width: 160 }} />} />
                  </Form.Item>
                  <Form.Item label="פריפריה" style={{ marginBottom: 8 }}>
                    <Controller name={`residence.${index}.geographicPeriphery`} control={control} render={({ field: f }) => <InputNumber value={f.value} onChange={(v) => f.onChange(v ?? undefined)} style={{ width: 100 }} />} />
                  </Form.Item>
                  <Form.Item label="התחלה" style={{ marginBottom: 8 }}>
                    <Controller name={`residence.${index}.startDate`} control={control} render={({ field: f }) => <Input {...f} placeholder="YYYY-MM-DD" style={{ width: 130 }} />} />
                  </Form.Item>
                  <Form.Item label="סיום" style={{ marginBottom: 8 }}>
                    <Controller name={`residence.${index}.endDate`} control={control} render={({ field: f }) => <Input {...f} placeholder="YYYY-MM-DD" style={{ width: 130 }} />} />
                  </Form.Item>
                </Space>
              </Card>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => residence.append({ city: '' })}>
              הוסף מגורים
            </Button>
          </Collapse.Panel>

          {/* ---- השכלה ---- */}
          <Collapse.Panel header="השכלה" key="education" forceRender>
            {education.fields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                style={{ marginBottom: 8 }}
                extra={
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => education.remove(index)} />
                }
              >
                <Space wrap>
                  {(['training', 'degree', 'field', 'institution'] as const).map((name) => (
                    <Form.Item key={name} label={EDUCATION_LABELS[name]} style={{ marginBottom: 8 }}>
                      <Controller
                        name={`education.${index}.${name}`}
                        control={control}
                        render={({ field: f }) => <Input {...f} style={{ width: 160 }} />}
                      />
                    </Form.Item>
                  ))}
                </Space>
              </Card>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => education.append({})}>
              הוסף השכלה
            </Button>
          </Collapse.Panel>

          {/* ---- קישורים ---- */}
          <Collapse.Panel header="קישורים" key="links" forceRender>
            {links.fields.map((field, index) => (
              <Space key={field.id} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Controller
                  name={`links.${index}.linkType`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value}
                      onChange={f.onChange}
                      options={[
                        { value: 'linkedin', label: 'לינקדאין' },
                        { value: 'wikipedia', label: 'ויקיפדיה' },
                        { value: 'knesset', label: 'כנסת' },
                        { value: 'other', label: 'אחר' },
                      ]}
                      style={{ width: 130 }}
                    />
                  )}
                />
                <Controller
                  name={`links.${index}.url`}
                  control={control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      placeholder="https://..."
                      status={errors.links?.[index]?.url ? 'error' : ''}
                      style={{ width: 320 }}
                    />
                  )}
                />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => links.remove(index)} />
              </Space>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => links.append({ linkType: 'other', url: '' })}>
              הוסף קישור
            </Button>
          </Collapse.Panel>

          {/* ---- ועדות ---- */}
          <Collapse.Panel header="ועדות" key="committees" forceRender>
            {committees.fields.map((field, index) => (
              <Space key={field.id} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Controller
                  name={`committees.${index}.participationType`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value}
                      onChange={f.onChange}
                      options={[
                        { value: 'participation', label: 'השתתפות' },
                        { value: 'management', label: 'ניהול' },
                        { value: 'chair', label: 'יושב ראש' },
                      ]}
                      style={{ width: 150 }}
                    />
                  )}
                />
                <Controller
                  name={`committees.${index}.committeeName`}
                  control={control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      placeholder="שם הוועדה"
                      status={errors.committees?.[index]?.committeeName ? 'error' : ''}
                      style={{ width: 280 }}
                    />
                  )}
                />
                <Form.Item label="מזהה (אופציונלי)" style={{ marginBottom: 0 }}>
                  <Controller
                    name={`committees.${index}.committeeId`}
                    control={control}
                    render={({ field: f }) => <Input {...f} style={{ width: 180 }} />}
                  />
                </Form.Item>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => committees.remove(index)} />
              </Space>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => committees.append({ participationType: 'participation', committeeName: '' })}>
              הוסף ועדה
            </Button>
          </Collapse.Panel>

          {/* ---- תמונות ---- */}
          <Collapse.Panel header="תמונות" key="images" forceRender>
            {images.fields.map((field, index) => (
              <Space key={field.id} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Controller
                  name={`images.${index}.imageType`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value}
                      onChange={f.onChange}
                      options={[
                        { value: 'primary', label: 'ראשי' },
                        { value: 'secondary', label: 'משני' },
                        { value: 'mobile', label: 'נייד' },
                        { value: 'thumbnail', label: 'תמונה קטנה' },
                      ]}
                      style={{ width: 140 }}
                    />
                  )}
                />
                <Controller
                  name={`images.${index}.url`}
                  control={control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      placeholder="https://..."
                      status={errors.images?.[index]?.url ? 'error' : ''}
                      style={{ width: 360 }}
                    />
                  )}
                />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => images.remove(index)} />
              </Space>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => images.append({ imageType: 'primary', url: '' })}>
              הוסף תמונה
            </Button>
          </Collapse.Panel>
        </Collapse>

        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {isEdit ? 'שמור שינויים' : 'צור מועמד'}
          </Button>
          {savedCandidate && (
            <Button onClick={() => navigate('/candidates')}>חזרה לרשימה</Button>
          )}
        </Space>
      </Form>

      {savedCandidate && (
        <CandidatePreviewCard
          candidate={savedCandidate}
          onClose={() => setSavedCandidate(null)}
        />
      )}
    </div>
  );
}
