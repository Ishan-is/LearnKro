import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, BookOpen } from "lucide-react";
import api from "../utils/api";
import CourseCard from "../components/course/CourseCard";

const categories = ["All", "Web Development", "Mobile Development", "Data Science", "Machine Learning", "Design", "Business", "Marketing", "Other"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const sortOptions = [
  { value: "-createdAt", label: "Newest" },
  { value: "-enrolledStudents", label: "Most Popular" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-averageRating", label: "Top Rated" },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const buildParams = () => {
    const params = new URLSearchParams({ sort, page, limit: 12 });
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    if (level !== "All") params.set("level", level);
    return params.toString();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["courses", search, category, level, sort, page],
    queryFn: () => api.get(`/courses?${buildParams()}`).then((r) => r.data),
    keepPreviousData: true,
  });

  const clearFilters = () => {
    setSearch(""); setCategory("All"); setLevel("All"); setSort("-createdAt"); setPage(1);
  };

  const hasFilters = search || category !== "All" || level !== "All";

  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-white mb-2">
          Explore <span className="gradient-text">Courses</span>
        </h1>
        <p className="text-gray-500">Discover thousands of courses from expert instructors</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-dark rounded-2xl border border-white/5 p-4 mb-8">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search courses, topics..."
            className="input pl-12 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  category === c
                    ? "bg-primary-600 text-white"
                    : "glass text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {/* Level filter */}
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="input text-sm py-1.5 w-auto"
            >
              {levels.map((l) => <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input text-sm py-1.5 w-auto"
            >
              {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 glass rounded-xl transition-colors">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-gray-600 mb-6">
          Showing {data.courses?.length} of {data.pagination?.total} courses
        </p>
      )}

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-3 skeleton rounded w-1/3" />
                <div className="h-4 skeleton rounded" />
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.courses?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(data.pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                    page === i + 1 ? "bg-primary-600 text-white" : "glass text-gray-400 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <BookOpen className="w-16 h-16 mx-auto text-gray-700 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      )}
    </div>
  );
}
