import React from "react";
import { Link } from "react-router-dom";
import { Star, Users, BookOpen } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="card-hover group block">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-dark-900">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary-400/30" />
          </div>
        )}
        
        {/* Badges on Thumbnail */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-dark-950/60 backdrop-blur-md text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/[0.06] shadow-sm">
            {course.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-base mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-300 text-[10px] font-bold">
            {course.instructor?.name?.charAt(0) || "I"}
          </div>
          <span className="text-xs text-gray-400">
            {course.instructor?.name || "Instructor"}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-amber-500 font-semibold">{course.averageRating?.toFixed(1) || "New"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{course.enrolledStudents?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold border ${
              course.level === "Beginner" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              course.level === "Intermediate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
              "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {course.level}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
          <span className="font-display font-bold text-lg text-white">
            {course.isFree || course.price === 0 ? (
              <span className="text-accent-500 font-semibold">Free</span>
            ) : (
              `₹${course.price}`
            )}
          </span>
          <span className="text-xs font-semibold text-primary-400 group-hover:text-primary-300 transition-colors">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
