import * as React from "react";

declare module "recharts" {
  // make all of the chart components valid JSX elements
  // you can add more components here as you use them
  type RechartsComponent<P = any> = React.JSXElementConstructor<P>;

  export const BarChart: RechartsComponent<any>;
  export const XAxis: RechartsComponent<any>;
  export const Bar: RechartsComponent<any>;
  export const Cell: RechartsComponent<any>;
  export const CartesianGrid: RechartsComponent<any>;
  export const Tooltip: RechartsComponent<any>;
  export const ResponsiveContainer: RechartsComponent<any>;
  export const PieChart: RechartsComponent<any>;
  export const Pie: RechartsComponent<any>;
}
