import React, { useEffect } from "react";
import "./index.css";
const {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} = require("recharts");
const vetapi = require("../api/vetapi");
const { amountAsLabel, formatAmount } = require("../helpers");

function TimelineTotal(props) {
  const [body, setBody] = React.useState(null);

  let graphProp = props.graph;
  let viewportProp = props.viewport;
  let filterProp = props.filters;

  useEffect(() => {
    let mounted = true;
    fetchData(mounted);

    return () => (mounted = false);
  }, [graphProp, viewportProp, filterProp]); /* eslint-disable-line */

  const fetchData = async (mounted) => {
    try {
      const { northeast, southwest } = props.viewport;
      const params = {
        ne_lat: northeast.lat,
        ne_lng: northeast.lng,
        sw_lat: southwest.lat,
        sw_lng: southwest.lng,
        carcinogen: props.filters.carcinogens || null,
        dioxin: props.filters.pbtsAndDioxins || null,
        chemical: props.filters.chemical,
        pbt: props.filters.pbtsAndDioxins || null,
        release_type: props.filters.releaseType,
      };
      const res = await vetapi.get(`/stats/location/timeline/total`, {
        params,
      });
      const body = (
        <div>
          <ResponsiveContainer width="100%" aspect={16 / 7}>
            <LineChart
              width={500}
              height={300}
              data={res.data}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" />
              <YAxis
                type="number"
                unit="lbs"
                width={100}
                tickFormatter={(val) => amountAsLabel(val) + " "}
              />
              <Tooltip
                contentStyle={{ color: "#000" }}
                isAnimationActive={false}
                itemSorter={(a) => -a.value}
                formatter={(value) => formatAmount(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#9c27b0"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8 }}
              ></Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

      if (mounted) setBody(body);
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return (
    body !== null && (
      <div className="graph standalone timeline-total">
        <div className="header">Total Releases</div>
        {body}
      </div>
    )
  );
}

export default TimelineTotal;
