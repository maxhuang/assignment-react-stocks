import React, { useEffect, useState } from "react";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";

import { Line } from 'react-chartjs-2';

import { getAuthToken, isAuthenticated } from "../utils/AuthTools"

const apiUrl = "http://131.181.190.87:3000";

/**
 * Displays the detailed stock data using a table and chart
 * with optional history filtering if the user is authenticated.
 * If the user is not authenticated only the latest stock entry
 * will be displayed in the table.
 * @param {Object} props
 */
function StockAdvanced(props) {
  const stockSymbol = props.match.params.stockSymbol;
  const baseStockUrl = `${apiUrl}/stocks`;

  const [rowData, setRowData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stockDetails, setStockDetails] = useState({
    name: "Stock Name",
    industry: "Stock Industry"
  });
  const [searchParam, setSearchParam] = useState({
    from: "2019-11-06",
    to: "2020-03-24"
  });
  const [searchError, setSearchError] = useState(null);

  const { needsRefetch, setNeedsRefetch } = props;

  const dateOptions = {
    timeZone: "UTC"
  };

  useEffect(() => {
    let headers = {
      accept: "application/json",
      "Content-Type": "application/json"
    };
    let url = null;

    if (isAuthenticated()) {
      let query = new URLSearchParams();
      for (let property in searchParam) {
        if (searchParam[property]) {
          query.append(property, searchParam[property]);
        }
      }
      url = `${baseStockUrl}/authed/${stockSymbol}?` + query.toString();
      headers.Authorization = "Bearer " + getAuthToken();
    } else {
      url = `${baseStockUrl}/${stockSymbol}`;
    }

    fetch(url, { headers })
      .then((res) => res.json())
      .then((res) => {
        if (!res.error) {
          setSearchError(null);
        } else {
          setSearchError(
            `No entries available for ${stockSymbol} for supplied date range`
          );
        }
        return res;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          return data;
        } else {
          return [data];
        }
      })
      .then((data) => {
        setRowData(data.map((stock) => {
          return {
            date: new Date(stock.timestamp).toLocaleDateString("en-AU", dateOptions),
            open: stock.open,
            high: stock.high,
            low: stock.low,
            close: stock.close,
            volumes: stock.volumes
          };
        }));

        setChartData(data.map((stock) => {
          return {
            x: stock.timestamp,
            y: stock.close
          };
        }));

        setNeedsRefetch(false);
      })
      .catch((err) => {
        console.error("A problem occured. Error: " + err);
      });
  }, [searchParam, needsRefetch]);

  useEffect(() => {
    const url = `${baseStockUrl}/${stockSymbol}`;
    fetch(url)
      .then((resp) => resp.json())
      .then((stock) => {
        if (stockDetails.name === "Stock Name") {
          setStockDetails({
            name: stock.name,
            industry: stock.industry,
            symbol: stock.symbol
          });

          document.title = `${stock.name} - CloudStocks`;
        }
      })
      .catch((err) => {
        console.error("A problem occured. Error: " + err);
      });

  }, []);

  return (
    <div className="my-5">
      <h1>{stockDetails.name}</h1>
      <h2>{stockSymbol}</h2>
      <h3 className="mb-3">{stockDetails.industry}</h3>

      {!isAuthenticated() &&
        <span className="badge badge-primary mb-2">Log in to unlock PRO features</span>
      }

      {isAuthenticated() ?
        <div>
          <div className="card mb-3">
            <div className="card-body">
              <SearchParamForm
                searchParam={searchParam}
                setSearchParam={setSearchParam}
              />
              {!searchError &&
                <StockTable
                  rowData={rowData}
                />
              }
            </div>
          </div>

          {(!searchError && chartData.length >= 2) &&
            <div className="card mb-3">
              <div className="card-body">
                <StockChart
                  chartData={chartData}
                />
              </div>
            </div>
          }
        </div>

        :

        <div className="card mb-3">
          <div className="card-body">
            <StockTable
              rowData={rowData}
            />
          </div>
        </div>
      }

      {searchError &&
        <div>
          <p>{searchError}</p>
        </div>
      }

    </div >
  );
}

/**
 * Returns controlled forms for setting the to and from
 * dates of a search
 * @param {Object} props
 */
function SearchParamForm(props) {
  const {
    searchParam,
    setSearchParam
  } = props;

  return (
    <form>
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label htmlFor="inputFrom">From</label>
            <input
              id="inputFrom"
              type="date"
              className="form-control"
              value={searchParam.from.slice(0, 10)}
              onChange={(event) => {
                const { value } = event.target;
                setSearchParam({
                  from: value,
                  to: searchParam.to
                });
              }}
            />
          </div>
        </div>

        <div className="col">
          <div className="form-group">
            <label htmlFor="inputTo">To</label>
            <input
              id="inputTo"
              type="date"
              className="form-control"
              value={searchParam.to.slice(0, 10)}
              onChange={(event) => {
                const { value } = event.target;
                setSearchParam({
                  from: searchParam.from,
                  to: value
                });
              }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * Returns a table populated with the results from
 * a server query
 * @param {Object} props
 */
function StockTable(props) {
  const { rowData } = props;

  const columnDefs = [
    { headerName: "Date", field: "date" },
    { headerName: "Open", field: "open", filter: "agNumberColumnFilter" },
    { headerName: "High", field: "high", filter: "agNumberColumnFilter" },
    { headerName: "Low", field: "low", filter: "agNumberColumnFilter" },
    { headerName: "Close", field: "close", filter: "agNumberColumnFilter" },
    { headerName: "Volumes", field: "volumes", filter: "agNumberColumnFilter" }
  ];

  return (
    <div
      className="ag-theme-balham"
      style={{
        height: "52.21em"
      }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        pagination={true}
        paginationPageSize={20}
        onGridSizeChanged={(params) => {
          params.api.sizeColumnsToFit();
        }}
      />
    </div>
  );
}

/**
 * Returns a line graph which is populated with results
 * from a server query
 * @param {Object} props
 */
function StockChart(props) {
  const { chartData } = props;

  const chartConfig = {
    scales: {
      xAxes: [{
        type: "time",
        ticks: {
          autoSkip: true,
          maxTicksLimit: 11
        }
      }]
    },
    legend: {
      display: true,
      position: "bottom",
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 15,
        hoverRadius: 5,
      }
    },
    animationSteps: 60
  };

  return (
    <Line
      data={{
        datasets: [{
          label: "Closing prices",
          data: chartData,
          lineTension: 0.1,
          backgroundColor: "#007bff38",
          borderColor: "#007bff",
        }]
      }}
      options={chartConfig}
    />
  );
}

export default StockAdvanced;
