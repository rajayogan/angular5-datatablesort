import { Component, ViewChild, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

//Angular Material 2
import { MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';

//Services
import { StudentService } from './student.service';

//rxjs
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  studentDetails = {
    studentName: '',
    studentAge: '',
    studentGrade: ''
  }


  displayedColumns = ['Name', 'Age', 'Grade'];
  studentDatabase = new studentDatabase(this.student);
  dataSource;

  constructor(private student: StudentService, private afs: AngularFirestore) {

  }

  ngOnInit() {
    this.dataSource = new StudentDataSource(this.studentDatabase, this.sort);
  }

  addStudent() {
    this.student.addStudent(this.studentDetails);
  }
}

export class studentDatabase {

  studentList = new BehaviorSubject([]);
  get data() { return this.studentList.value };

  constructor(private student: StudentService) {
    this.student.getStudents().subscribe((student) => {
      this.studentList.next(student);
    })
  }
}

export class StudentDataSource extends DataSource<any> {

  constructor(private studentDB: studentDatabase, private sort: MatSort) {
  super()
  }

  connect(): Observable<any> {
    const studentData = [
      this.studentDB.studentList,
      this.sort.sortChange
    ];

    return Observable.merge(...studentData).map(() => {
      return this.getSortedData();
    })
  }

  disconnect() {

  }

  getSortedData() {
    const data = this.studentDB.data.slice();
    if (!this.sort.active || this.sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this.sort.active) {
        case 'Name': [propertyA, propertyB] = [a.studentName, b.studentName]; break;
        case 'Age': [propertyA, propertyB] = [a.studentAge, b.studentAge]; break;
        case 'Grade': [propertyA, propertyB] = [a.studentGrade, b.studentGrade]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
    });
  }
}