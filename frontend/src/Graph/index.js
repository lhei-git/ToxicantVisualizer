import {
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
require("dotenv").config();
const React = require("react");

var TopToxicants = (props) => {
  const data = [];
  for (const p of props.points) {
    const index = data.findIndex((d) => d.name === p.chemical);
    if (data[index] === undefined) {
      if (data.length < 5)
        data.push({
          name: p.chemical,
          uv: 1,
        });
    } else {
      const old = data[index];
      data[index] = {
        name: old.name,
        uv: old.uv + 1,
      };
    }
  }

  return (
    <div>
      <BarChart width={730} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {/* <Tooltip /> */}
        <Legend />
        <Bar dataKey="uv" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: [],
    };
  }

  componentDidUpdate(prevProps) {
    const before = JSON.stringify(prevProps.points);
    const after = JSON.stringify(this.props.points);
    if (after !== before) {
      this.setState({
        points: this.props.points,
      });
    }
  }

  render() {
    return (
      <div className="container">
        <TopToxicants points={this.state.points} />
      </div>
    );
  }
}

export default Graph;
