import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Course } from "../model/course";
import { CoursesService } from "../services/courses.service";
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  catchError,
  finalize,
  map,
  switchMap,
} from "rxjs/operators";
import { merge, fromEvent, throwError } from "rxjs";
import { Lesson } from "../model/lesson";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.scss"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  course: Course;

  lessons: Lesson[];

  loading = false;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {}

  displayedColumns = ["seqNo", "description", "duration"];

  expandedLesson: Lesson = null;

  ngOnInit() {
    this.course = this.route.snapshot.data["course"];
    this.loadLessonsPage();
  }

  loadLessonsPage() {
    this.loading = true;
    this.coursesService
      .findLessons(
        this.course.id,
        this.sort?.direction ?? "asc",
        this.paginator?.pageIndex ?? 0,
        this.paginator?.pageSize ?? 3,
        this.sort?.active ?? "seqNo"
      )
      .pipe(
        switchMap((lessons) => (this.lessons = lessons)),
        catchError((err) => {
          console.log("Error loading lessons", err);
          alert("Error loading lessons");

          return throwError(err);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  onToggleLesson(lesson: Lesson) {
    if (lesson == this.expandedLesson) {
      this.expandedLesson = null;
    } else {
      this.expandedLesson = lesson;
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0)); // Go back to page 1 if selecting a sort option

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(map(() => this.loadLessonsPage()))
      .subscribe();
  }
}
