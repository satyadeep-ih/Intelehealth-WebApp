import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MonitoringService } from "src/app/services/monitoring.service";
import * as moment from "moment";
import { MatTabChangeEvent } from "@angular/material/tabs";

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["./monitoring.component.css"],
})
export class MonitoringComponent implements OnInit {
  @ViewChild("page0") paginator0: MatPaginator;
  @ViewChild("page1") paginator1: MatPaginator;
  @ViewChild("sort0") sort0: MatSort;
  @ViewChild("sort1") sort1: MatSort;
  drDisplayedColumns: string[] = [];
  hwDisplayedColumns: string[] = [];
  drColumns: any = [
    { label: "Name of HW", key: "name" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "Current Status", key: "status" },
  ];
  hwColumns: any = [
    { label: "Name of HW", key: "name" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Android Version", key: "androidVersion" },
    { label: "App Version", key: "version" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "Last Activity", key: "lastActivity" },
    { label: "Current Status", key: "status" },
  ];
  data: any = [];
  allData: any = [];
  dataSource;
  selectedIndexBinding;

  constructor(private monitorService: MonitoringService) {
    this.hwDisplayedColumns = this.hwColumns.map((c) => c.key);
    this.drDisplayedColumns = this.drColumns.map((c) => c.key);
  }

  ngOnInit(): void {
    this.getStatuses();
    setTimeout(() => {
      this.getStatuses();
    }, 2000);
  }

  filterData() {
    setTimeout(() => {
      let page = 0;
      this.data = this.allData.filter((d) => {
        if (this.selectedIndexBinding) {
          page = 0;
          return d.userType === "Doctor";
        } else {
          page = 1;
          return d.userType === "Health Worker";
        }
      });
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = page == 1 ? this.paginator0 : this.paginator1;
      this.dataSource.sort = page === 1 ? this.sort0 : this.sort1;
    }, 0);
  }

  get len() {
    return this.data.length;
  }

  getStatuses() {
    this.monitorService.getAllStatuses().subscribe({
      next: (res: any) => {
        this.allData = res?.data || this.allData;
        this.filterData();
      },
    });
  }

  tabChange(changeEvent: MatTabChangeEvent) {
    // console.log("Tab position: " + changeEvent.tab.position);
    this.filterData();
  }

  showValue(obj, key) {
    if (["lastSyncTimestamp", "lastLogin"].includes(key)) {
      return moment(obj[key]).format("MMM DD YYYY hh:mm A");
    } else {
      return obj[key];
    }
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }
}