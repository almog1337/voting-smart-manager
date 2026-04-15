import { Button, Card, Checkbox, Form, Input, InputNumber, Select, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { Party } from '../types';

interface Props {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  parties: Party[];
}

const ROLE_TYPES = [
  { value: 'party', label: 'מפלגה' },
  { value: 'military', label: 'צבאי' },
  { value: 'knesset', label: 'כנסת' },
  { value: 'public', label: 'ציבורי' },
  { value: 'other', label: 'אחר' },
];

function RoleRow({
  index,
  control,
  parties,
  onRemove,
}: {
  index: number;
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  parties: Party[];
  onRemove: () => void;
}) {
  const roleType = useWatch({ control, name: `roles.${index}.roleType` });
  const partyOptions = parties.map((p) => ({ value: p._id, label: p.name }));

  return (
    <Card
      size="small"
      style={{ marginBottom: 8 }}
      extra={
        <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove} />
      }
    >
      <Space wrap style={{ width: '100%' }}>
        <Form.Item label="סוג" style={{ marginBottom: 8, minWidth: 140 }}>
          <Controller
            name={`roles.${index}.roleType`}
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(val) => field.onChange(val)}
                options={ROLE_TYPES}
                style={{ width: 140 }}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="כותרת" style={{ marginBottom: 8, minWidth: 200 }}>
          <Controller
            name={`roles.${index}.title`}
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="כותרת התפקיד" style={{ width: 200 }} />
            )}
          />
        </Form.Item>

        <Form.Item label="התחלה" style={{ marginBottom: 8 }}>
          <Controller
            name={`roles.${index}.startDate`}
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="YYYY-MM-DD" style={{ width: 130 }} />
            )}
          />
        </Form.Item>

        <Form.Item label="סיום" style={{ marginBottom: 8 }}>
          <Controller
            name={`roles.${index}.endDate`}
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="YYYY-MM-DD" style={{ width: 130 }} />
            )}
          />
        </Form.Item>

        <Form.Item label="פעיל" style={{ marginBottom: 8 }}>
          <Controller
            name={`roles.${index}.isActive`}
            control={control}
            render={({ field }) => (
              <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
            )}
          />
        </Form.Item>
      </Space>

      {roleType === 'party' && (
        <Space wrap>
          <Form.Item label="מפלגה" style={{ marginBottom: 8, minWidth: 200 }}>
            <Controller
              name={`roles.${index}.partyId`}
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={partyOptions}
                  placeholder="בחר מפלגה"
                  style={{ width: 200 }}
                />
              )}
            />
          </Form.Item>
          <Form.Item label="מיקום בטיקט" style={{ marginBottom: 8 }}>
            <Controller
              name={`roles.${index}.listPosition`}
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={1} style={{ width: 120 }} />
              )}
            />
          </Form.Item>
        </Space>
      )}

      {roleType === 'military' && (
        <Space wrap>
          <Form.Item label="דרגה" style={{ marginBottom: 8 }}>
            <Controller
              name={`roles.${index}.rank`}
              control={control}
              render={({ field }) => <Input {...field} style={{ width: 160 }} />}
            />
          </Form.Item>
          <Form.Item label="יחידה" style={{ marginBottom: 8 }}>
            <Controller
              name={`roles.${index}.unit`}
              control={control}
              render={({ field }) => <Input {...field} style={{ width: 160 }} />}
            />
          </Form.Item>
        </Space>
      )}

      {roleType === 'knesset' && (
        <Form.Item label="מספר כנסת" style={{ marginBottom: 8 }}>
          <Controller
            name={`roles.${index}.knessetNum`}
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={1} style={{ width: 120 }} />
            )}
          />
        </Form.Item>
      )}

      {roleType === 'public' && (
        <Form.Item label="משרד" style={{ marginBottom: 8 }}>
          <Controller
            name={`roles.${index}.ministry`}
            control={control}
            render={({ field }) => <Input {...field} style={{ width: 240 }} />}
          />
        </Form.Item>
      )}
    </Card>
  );
}

export default function RoleFieldArray({ control, parties }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'roles' });

  return (
    <div>
      {fields.map((field, index) => (
        <RoleRow
          key={field.id}
          index={index}
          control={control}
          parties={parties}
          onRemove={() => remove(index)}
        />
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => append({ roleType: 'other', title: '', isActive: false })}
      >
        הוסף תפקיד
      </Button>
    </div>
  );
}
