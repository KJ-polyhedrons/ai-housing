import { SearchForm } from "@/components/search/SearchForm";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">条件を入力</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          あなたの家族構成や希望条件を教えてください
        </p>
      </div>
      <SearchForm />
    </div>
  );
}
