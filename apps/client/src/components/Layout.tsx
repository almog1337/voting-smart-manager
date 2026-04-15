import { Layout, Menu } from 'antd';
import {
  TeamOutlined,
  BankOutlined,
  TagsOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content } = Layout;

const NAV_ITEMS = [
  { key: '/candidates', icon: <TeamOutlined />, label: 'מועמדים' },
  { key: '/parties', icon: <BankOutlined />, label: 'מפלגות' },
  { key: '/tickets', icon: <TagsOutlined />, label: 'טיקטים' },
  { key: '/ticket-attributes', icon: <ApartmentOutlined />, label: 'מאפייני טיקטים' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ?? '/candidates';

  return (
    <Layout style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Sider theme="light" width={220} style={{ background: '#ffffff', borderInlineStart: '1px solid #e5e7eb' }}>
        {/* Brand header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2952d9, #5982fe)',
            padding: '18px 24px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 17, letterSpacing: 0.3 }}>
            בוחרים חכם
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>
            לוח ניהול
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#ffffff', borderInlineEnd: 'none', marginTop: 4 }}
        />
      </Sider>

      <Layout style={{ background: '#f3f4f6' }}>
        <Content
          style={{
            padding: 28,
            background: '#f3f4f6',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
