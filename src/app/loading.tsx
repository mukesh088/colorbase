export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
