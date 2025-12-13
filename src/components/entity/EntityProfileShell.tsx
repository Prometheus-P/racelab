import { ReactNode } from 'react';

interface EntityProfileShellProps {
  children: ReactNode;
}

const EntityProfileShell = ({ children }: EntityProfileShellProps) => {
  return <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm print:bg-white">{children}</div>;
};

export default EntityProfileShell;
