export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
        <p>
          ※ 掲載情報は参考情報です。最新の保育園・学区情報は各自治体にご確認ください。
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} AI住宅コンシェルジュ - 宅地建物取引士監修
        </p>
      </div>
    </footer>
  );
}
