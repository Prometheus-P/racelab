interface BookPageShellProps {
  children: React.ReactNode;
}

export function BookPageShell({ children }: BookPageShellProps) {
  return (
    <div className="book-page mx-auto max-w-6xl space-y-6 px-4 py-6 text-base text-gray-900 md:text-lg">
      {children}
    </div>
  );
}

export default BookPageShell;
