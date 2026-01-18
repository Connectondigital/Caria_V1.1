import React, { useEffect, useState } from "react";
import MiniCalendar from "components/calendar/MiniCalendar";
// import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
// import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";
import { propertyService, inquiryService } from "../../../api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    inquiries: [],
    stats: {
      totalProperties: 0,
      activeInquiries: 0,
      monthlyAdded: 0,
      totalPortfolioValue: 0
    },
    distribution: [0, 0, 0, 0] // Villa, Daire, Arsa, Ticari
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propResp = await propertyService.getProperties();
        const inqResp = await inquiryService.getInquiries();

        const properties = propResp.data || [];
        const inquiries = inqResp.data || [];

        // Portfolio Value Calculation
        const totalValue = properties.reduce((acc, prop) => {
          const price = parseFloat(prop.price?.toString().replace(/[^0-9.]/g, '') || 0);
          return acc + price;
        }, 0);

        // Monthly Added Calculation
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyCount = properties.filter(p => new Date(p.created_at) >= firstDayOfMonth).length;

        // Distribution
        const dist = { Villa: 0, Daire: 0, Arsa: 0, Ticari: 0 };
        properties.forEach(p => {
          const title = (p.title || "").toLowerCase();
          if (title.includes("villa")) dist.Villa++;
          else if (title.includes("daire") || title.includes("apartment")) dist.Daire++;
          else if (title.includes("arsa") || title.includes("land")) dist.Arsa++;
          else if (title.includes("ticari") || title.includes("commercial")) dist.Ticari++;
          else dist.Daire++; // Default to Daire if unknown
        });

        setDashboardData({
          properties,
          inquiries,
          stats: {
            totalProperties: properties.length,
            activeInquiries: inquiries.filter(i => i.status === 'new' || i.status === 'pending').length,
            monthlyAdded: monthlyCount,
            totalPortfolioValue: totalValue
          },
          distribution: [dist.Villa, dist.Daire, dist.Arsa, dist.Ticari]
        });
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Card widget */}

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4">
        <Widget
          icon={<IoMdHome className="h-7 w-7 text-brand-500" />}
          title={"Toplam İlan Sayısı"}
          subtitle={dashboardData.stats.totalProperties}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6 text-brand-500" />}
          title={"Bekleyen Müşteri Talepleri"}
          subtitle={dashboardData.stats.activeInquiries}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7 text-brand-500" />}
          title={"Bu Ay Eklenenler"}
          subtitle={dashboardData.stats.monthlyAdded}
        />
        <Widget
          icon={<MdDashboard className="h-6 w-6 text-brand-500" />}
          title={"Portföy Değeri (£)"}
          subtitle={`£ ${dashboardData.stats.totalPortfolioValue.toLocaleString('en-GB')}`}
        />
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Check Table (Inquiries) */}
        <div>
          <CheckTable
            title="Son Gelen Müşteri Talepleri"
            tableData={dashboardData.inquiries.slice(0, 5)}
          />
        </div>

        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard data={dashboardData.distribution} />
        </div>

        {/* Complex Table (Properties) */}
        <ComplexTable
          title="Son Eklenen 5 İlan"
          tableData={dashboardData.properties.slice(0, 5).map(p => ({
            name: p.title,
            region: p.region || p.location,
            price: p.price,
            status: p.status || "Published"
          }))}
        />

        {/* Task chart & Calendar */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar title="Viewing Schedule" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
