interface Props {
  data: number[];
}

const PredictionDisplay: React.FC<Props> = ({ data }) => {
  return (
    <div id="data-display">
      {data.map((num, idx, arr) => (
        <div className="data-column-container">
          <div
            className={`data-column ${
              arr.indexOf(Math.max(...arr)) === idx ? "prediction" : ""
            }`}
            style={{ height: num * 100 }}
            key={idx}
          ></div>
          <h2>{idx}</h2>
        </div>
      ))}
    </div>
  );
};
export default PredictionDisplay;
