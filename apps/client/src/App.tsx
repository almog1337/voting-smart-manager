import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import heIL from 'antd/locale/he_IL';
import AppLayout from './components/Layout';
import CandidatesPage from './pages/CandidatesPage';
import CandidateFormPage from './pages/CandidateFormPage';
import CandidateViewPage from './pages/CandidateViewPage';
import PartiesPage from './pages/PartiesPage';
import PartyFormPage from './pages/PartyFormPage';
import PartyViewPage from './pages/PartyViewPage';
import TicketsPage from './pages/TicketsPage';
import TicketFormPage from './pages/TicketFormPage';
import TicketViewPage from './pages/TicketViewPage';
import TicketAttributesPage from './pages/TicketAttributesPage';
import TicketAttributeFormPage from './pages/TicketAttributeFormPage';
import TicketAttributeViewPage from './pages/TicketAttributeViewPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <ConfigProvider
      direction="rtl"
      locale={heIL}
      theme={{
        token: {
          // Brand
          colorPrimary: '#2952d9',
          colorPrimaryHover: '#5982fe',

          // Semantic
          colorSuccess: '#88b12d',
          colorWarning: '#fa8501',
          colorError: '#d93025',
          colorInfo: '#50bab6',

          // Text
          colorText: '#1a1b2e',
          colorTextSecondary: '#6b7280',
          colorTextTertiary: '#868e96',
          colorTextQuaternary: '#ced4da',

          // Backgrounds
          colorBgBase: '#fcfcfc',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f3f4f6',
          colorBgElevated: '#ffffff',
          colorFillAlter: '#f1f3f5',
          colorFillContent: '#f3f4f6',
          colorFillSecondary: '#e9ecef',

          // Borders
          colorBorder: '#e5e7eb',
          colorBorderSecondary: '#e9ecef',
          colorSplit: '#e5e7eb',

          // Shadows
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
          boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.08)',

          // Typography
          fontFamily: "'Segoe UI', 'Arial Hebrew', Arial, sans-serif",
          borderRadius: 8,
          borderRadiusLG: 10,
          borderRadiusSM: 6,
        },
        components: {
          Layout: {
            siderBg: '#ffffff',
            headerBg: '#ffffff',
            bodyBg: '#f3f4f6',
          },
          Menu: {
            itemBg: '#ffffff',
            itemColor: '#424b68',
            itemHoverColor: '#2952d9',
            itemHoverBg: '#f1f3f5',
            itemSelectedBg: '#eef2ff',
            itemSelectedColor: '#2952d9',
            itemActiveBg: '#eef2ff',
          },
          Card: {
            colorBorderSecondary: '#e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
          },
          Table: {
            headerBg: '#f1f3f5',
            headerColor: '#424b68',
            borderColor: '#e5e7eb',
            rowHoverBg: '#f8f9fa',
            colorBgContainer: '#ffffff',
          },
          Button: {
            colorPrimary: '#2952d9',
            colorPrimaryHover: '#5982fe',
            colorPrimaryActive: '#1a3bba',
            defaultBorderColor: '#e5e7eb',
            defaultColor: '#1a1b2e',
          },
          Input: {
            colorBorder: '#e5e7eb',
            colorBgContainer: '#ffffff',
            hoverBorderColor: '#5982fe',
            activeBorderColor: '#2952d9',
          },
          Select: {
            colorBorder: '#e5e7eb',
            colorBgContainer: '#ffffff',
            optionSelectedBg: '#f1f3f5',
            optionSelectedColor: '#2952d9',
          },
          Collapse: {
            headerBg: '#f8f9fa',
            colorBorder: '#e5e7eb',
          },
          Tag: {
            colorBorder: '#e9ecef',
          },
          Descriptions: {
            colorSplit: '#e5e7eb',
          },
          Typography: {
            colorText: '#1a1b2e',
            colorTextSecondary: '#6b7280',
          },
          Popconfirm: {
            colorWarning: '#fa8501',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AntApp>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/candidates" replace />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/candidates/new" element={<CandidateFormPage />} />
                <Route path="/candidates/:id/edit" element={<CandidateFormPage />} />
                <Route path="/candidates/:id" element={<CandidateViewPage />} />
                <Route path="/parties" element={<PartiesPage />} />
                <Route path="/parties/new" element={<PartyFormPage />} />
                <Route path="/parties/:id/edit" element={<PartyFormPage />} />
                <Route path="/parties/:id" element={<PartyViewPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/new" element={<TicketFormPage />} />
                <Route path="/tickets/:id/edit" element={<TicketFormPage />} />
                <Route path="/tickets/:id" element={<TicketViewPage />} />
                <Route path="/ticket-attributes" element={<TicketAttributesPage />} />
                <Route path="/ticket-attributes/new" element={<TicketAttributeFormPage />} />
                <Route path="/ticket-attributes/:id/edit" element={<TicketAttributeFormPage />} />
                <Route path="/ticket-attributes/:id" element={<TicketAttributeViewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AntApp>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
