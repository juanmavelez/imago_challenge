import { Header } from "./components/Header";
import { SearchControls } from "./components/SearchControls";
import { MainResults } from "./components/MainResults";
import { SearchService } from "./api/search/SearchService";
import { SORT_OPTIONS } from "@/app/constants/sortOptions";
import { AnalyticsStore } from "@/lib/analytics/AnalyticsStore";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Home = async (props: PageProps) => {
  const searchParams = await props.searchParams;

  // Safely extract and validate URL parameters.
  // Next.js searchParams can be undefined, string, or string[].
  // We ensure we only pass the expected primitive types (string/number) to the Service.
  const query = typeof searchParams.query === "string" ? searchParams.query : "";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const defaultSort = SORT_OPTIONS.RELEVANCE;
  const dateSort = typeof searchParams.dateSort === "string" ? searchParams.dateSort : defaultSort;
  const credit = typeof searchParams.credit === "string" ? searchParams.credit : null;
  const restrictions = typeof searchParams.restrictions === "string" ? searchParams.restrictions : null;
  const dateStart = typeof searchParams.dateStart === "string" ? searchParams.dateStart : null;
  const dateEnd = typeof searchParams.dateEnd === "string" ? searchParams.dateEnd : null;


  const startTime = performance.now();
  const result = SearchService.executeSearch({
    query,
    page: page || 1,
    limit: 20,
    dateSort,
    credit,
    restrictions,
    dateStart,
    dateEnd
  });
  const endTime = performance.now();

  AnalyticsStore.trackSearch(query, endTime - startTime);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans p-6 sm:p-12">
      <main className="max-w-6xl mx-auto flex flex-col gap-8">

        <Header />
        <SearchControls />

        <MainResults
          total={result.total}
          results={result.items}
          totalPages={result.totalPages}
        />

      </main>
    </div>
  );
};

export default Home;
