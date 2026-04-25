import { NavLink, useLocation } from "react-router-dom";
import { Avatar, Button, Layout, Menu, Typography } from "antd";
import {
  LayoutDashboard,
  Clock,
  Bell,
  Settings,
  LogOut,
  UserRound,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  {
    key: "/",
    icon: <LayoutDashboard size={18} />,
    label: "DASHBOARD",
    path: "/",
  },
  {
    key: "/time-logs",
    icon: <Clock size={18} />,
    label: "TIME LOGS",
    path: "/time-logs",
  },
  {
    key: "/notifications",
    icon: <Bell size={18} />,
    label: "NOTIFICATIONS",
    path: "/notifications",
  },
];

export function Sidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const selectedKey = location.pathname;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Unable to sign out", error);
    }
  };

  return (
    <Layout.Sider
      width={260}
      className="h-screen  fixed top-0 left-0 z-10 border-r border-outline-variant bg-surface-container"
    >
      <div className="p-6 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center"></div>
          <div>
            <h2 className="text-primary m-0 tracking-tight text-xl">
              LoE Tracker
            </h2>
          </div>
        </div>
      </div>

      <div className="px-3 pt-6 pb-4">
        <Typography.Text className="text-sm text-on-surface-variant tracking-widest font-bold uppercase">
          MAIN MENU
        </Typography.Text>
        <Menu
          theme="dark"
          mode="inline"
          selectable
          selectedKeys={[selectedKey]}
          className="mt-4 bg-transparent border-none"
          items={navItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <NavLink to={item.path}>{item.label}</NavLink>,
          }))}
        />
      </div>

      <div className="mt-auto p-6 border-t border-outline-variant">
        <div className="rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              icon={<UserRound size={16} />}
              size={40}
              className="bg-primary/10 text-primary"
            />
            <div className="min-w-0">
              <Typography.Text className="truncate text-sm font-semibold text-on-surface block">
                {user?.email ?? "Signed in"}
              </Typography.Text>
            </div>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectable
          selectedKeys={[selectedKey]}
          className="bg-transparent border-none"
          items={[
            {
              key: "/settings",
              icon: <Settings size={18} />,
              label: <NavLink to="/settings">SETTINGS</NavLink>,
            },
          ]}
        />

        <Button
          type="text"
          icon={<LogOut size={18} />}
          onClick={handleSignOut}
          className="mt-3 px-8 text-on-surface-variant hover:text-error"
        >
          SIGN OUT
        </Button>
      </div>
    </Layout.Sider>
  );
}
