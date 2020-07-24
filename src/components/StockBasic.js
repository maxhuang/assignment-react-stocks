import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import {
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const apiUrl = "http://131.181.190.87:3000";

/**
 * Component for displaying the basic stock details for
 * all stocks in a table. The form group can be used to
 * change the search parameters.
 */
function StockBasic() {
  const history = useHistory();

  const baseStockUrl = `${apiUrl}/stocks/`;
  const basicStockUrl = `${baseStockUrl}/symbols`;

  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchName, setSearchName] = useState("");

  const gridApi = useRef();
  const [rowData, setRowData] = useState([]);
  const columnDefs = [
    { headerName: "Name", field: "name" },
    { headerName: "Symbol", field: "symbol" },
    { headerName: "Industry", field: "industry" }
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [nameFilteredAll, setNameFilteredAll] = useState(false);

  useEffect(() => {
    document.title = "All Stocks - CloudStocks";
  }, []);

  useEffect(() => {
    let query = "";
    if (searchIndustry) {
      query = "?industry=" + searchIndustry;
    }
    fetch(basicStockUrl + query)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSearchError(null);
        } else {
          setSearchError(data.message);
        }
        return data;
      })
      .then((data) => {
        return Array.isArray(data) ? data : [data];
      })
      .then((data) => data.map((stock) => {
        return {
          id: stock.symbol,
          name: stock.name,
          symbol: stock.symbol,
          industry: stock.industry
        };
      }))
      .then((stocks) => {
        if (stocks !== []) {
          setRowData(stocks);
        }
      })
      .catch((err) => {
        console.error("A problem occured. Error: " + err);
      });
  }, [basicStockUrl, searchIndustry]);

  useEffect(() => {
    try {
      if (!gridApi.current) {
        // Wait for table to be loaded asynchronously
        return;
      }

      let filterInstance = gridApi.current.getFilterInstance("name");
      filterInstance.setModel({
        type: "contains",
        filter: searchName
      });
      gridApi.current.onFilterChanged();

      const numRows = gridApi.current.getDisplayedRowCount();
      setNameFilteredAll(numRows === 0);
    } catch (err) {
      // We have a stale gridApi value so we need to wait for the
      // next render of the table to refresh it. Also ag grid will
      // output a lot of errors to your log when this happens. Just
      // ignore.
      // This should not happen as the table is now hidden instead
      // of being destroyed with a component unmount
      setNameFilteredAll(false);
    }
  }, [searchName, rowData]);

  function getStockTableVisibility() {
    return (nameFilteredAll || searchError) ? "d-none" : "";
  }

  return (
    <div className="my-5">
      <h1 className="mb-3">All Stocks</h1>
      <div className="card">
        <div className="card-body">
          <SearchParamForm
            searchName={searchName}
            setSearchName={setSearchName}
            searchIndustry={searchIndustry}
            setSearchIndustry={setSearchIndustry}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />

          <div>
            <div className={getStockTableVisibility()}>
              <StockTable
                history={history}
                gridApi={gridApi}
                columnDefs={columnDefs}
                rowData={rowData}
              />
            </div>

          </div>

          {(nameFilteredAll && !searchError) &&
            <p>No stocks could be found for your search</p>
          }
          {searchError &&
            <p>{searchError}</p>
          }

        </div>
      </div>
    </div >
  );
}

/**
 * Displays a labelled form group which allows the user to
 * change the search parameters
 * @param {Object} props
 */
function SearchParamForm(props) {
  const {
    searchName,
    setSearchName,
    searchIndustry,
    setSearchIndustry,
    dropdownOpen,
    setDropdownOpen
  } = props;

  const industryList = [
    "Consumer Discretionary",
    "Consumer Staples",
    "Energy",
    "Financials",
    "Health Care",
    "Industrials",
    "Information Technology",
    "Materials",
    "Real Estate",
    "Telecommunication Services",
    "Utilities"
  ];

  const industryDropdownElements = industryList.map((industry) => {
    return (
      <DropdownItem
        key={
          "dropdownItem" + industry.split(" ").join("")
        }
        value={industry}
        onClick={(event) => {
          setSearchIndustry(event.target.value);
        }}
      >
        {industry}
      </DropdownItem>
    );
  });

  return (
    <form>
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label htmlFor="inputName">Name</label>
            <input
              id="inputName"
              type="text"
              className="form-control"
              placeholder="Filter by name"
              value={searchName}
              onChange={(event) => {
                const { value } = event.target;
                setSearchName(value);
              }}
            />
          </div>
        </div>

        <div className="col">
          <div className="form-group">
            <label htmlFor="inputIndustry">Industry</label>
            <div className="input-group">

              <input
                id="inputIndustry"
                type="text"
                className="form-control"
                placeholder="Filter by industry"
                value={searchIndustry}
                onChange={(event) => {
                  const { value } = event.target;
                  setSearchIndustry(value);
                }}
              />

              <InputGroupButtonDropdown
                addonType="append"
                isOpen={dropdownOpen}
                toggle={() => {
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <DropdownToggle
                  caret
                  outline
                  colour="link"
                >
                  Select
                </DropdownToggle>
                <DropdownMenu right>
                  {industryDropdownElements}
                </DropdownMenu>
              </InputGroupButtonDropdown>

            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * Returns a table populated with the search results from
 * a servery query
 * @param {Object} props
 */
function StockTable(props) {
  const {
    history,
    gridApi,
    columnDefs,
    rowData
  } = props;

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
        onGridReady={(params) => {
          gridApi.current = params.api;
        }}
        onGridSizeChanged={(params) => {
          params.api.sizeColumnsToFit();
        }}
        onRowDataChanged={(params) => {
          params.api.paginationGoToFirstPage();
        }}
        onRowClicked={(params) => {
          const stockSymbol = params.data.symbol;
          history.push(`stocks/${stockSymbol}`)
        }}
      />
    </div>
  );
}

export default StockBasic;
