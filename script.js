document.addEventListener('DOMContentLoaded', function() {
  // Repository URL and ID
  var repositoryURL = 'http://localhost:7200';
  var repositoryId = 'HealthData';

  // Elements
  var patientForm = document.getElementById('patientForm');
  var patientSelect = document.getElementById('patientSelect');
  var pageTitle = document.getElementById('pageTitle');
  var backButton = document.getElementById('backButton');
  var submitButton = document.getElementById('submitButton');
  var observablePropertiesContainer = document.getElementById('observablePropertiesContainer');
  var dateSelectionContainer = document.getElementById('dateSelectionContainer');
  var startDateInput = document.getElementById('startDate');
  var endDateInput = document.getElementById('endDate');

  // Array to store patient names and selected patient index
  var patients = [];
  var selectedPatientIndex = -1;

  // SPARQL query to diplay the patient names from the GraphDB repository
  var query = `PREFIX sosa: <http://www.w3.org/ns/sosa/>
              PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              SELECT ?name WHERE {
                ?name rdf:type sosa:FeatureOfInterest.
              }`;

  // Fetch the patient names from the repository
  fetch(repositoryURL + '/repositories/' + repositoryId, {
    method: 'POST',
    headers: {
      Accept: 'application/sparql-results+json',
      'Content-Type': 'application/sparql-query',
    },
    body: query,
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to execute the SPARQL query.');
      }
      return response.json();
    })
    .then(function(data) {
      // Process the query results. Keep only the name of the URI.
      if (data.results.bindings.length > 0) {
        for (var i = 0; i < data.results.bindings.length; i++) {
          var uri = data.results.bindings[i].name.value;
          var name = getNameFromURI(uri);
          patients.push(name);
          var option = document.createElement('option');
          option.value = i.toString();
          option.textContent = name;
          patientSelect.appendChild(option);
        }
      } else {
        // No results found
        patientSelect.disabled = true;
        var option = document.createElement('option');
        option.textContent = 'No patients found.';
        patientSelect.appendChild(option);
      }
    })
    .catch(function(error) {
      // Error handling for query execution
      patientSelect.disabled = true;
      var option = document.createElement('option');
      option.textContent = 'Error retrieving data.';
      patientSelect.appendChild(option);
      console.error(error);
    });

  // Event listener for patient selection change
  patientSelect.addEventListener('change', function() {
    selectedPatientIndex = parseInt(patientSelect.value);
    var selectedPatient = patients[selectedPatientIndex];

    // SPARQL query to diplay observable properties for the selected patient from the GraphDB repository
    var query = `PREFIX sosa: <http://www.w3.org/ns/sosa/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sosa-foi: <http://www.w3.org/ns/sosa/FeatureOfInterest/>
                SELECT DISTINCT ?ObservableProperty WHERE {
                  ?obs sosa:observedProperty ?ObservableProperty.
                  ?obs sosa:hasFeatureOfInterest sosa-foi:${selectedPatient}.
                  ?ObservableProperty rdf:type sosa:ObservableProperty.
                }`;

    // Fetch the observable properties for the selected patient
    fetch(repositoryURL + '/repositories/' + repositoryId, {
      method: 'POST',
      headers: {
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/sparql-query',
      },
      body: query,
    })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to execute the SPARQL query.');
        }
        return response.json();
      })
      .then(function(data) {
        // Process the query results and populate the observable properties container
        observablePropertiesContainer.innerHTML = '';

        if (data.results.bindings.length > 0) {
          for (var i = 0; i < data.results.bindings.length; i++) {
            var observableProperty = data.results.bindings[i].ObservableProperty.value;
            var name = getNameFromURI(observableProperty);

            var radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.name = 'observableProperty';
            radioButton.value = observableProperty;

            var label = document.createElement('label');
            label.textContent = name;

            var container = document.createElement('div');
            container.appendChild(radioButton);
            container.appendChild(label);

            observablePropertiesContainer.appendChild(container);
          }

          // Display the date selection container and submit button
          dateSelectionContainer.style.display = 'block';
          submitButtonContainer.style.display = 'block';
        } else {
          // No observable properties found
          var message = document.createElement('p');
          message.textContent = 'No observable properties found for this patient.';
          observablePropertiesContainer.appendChild(message);

          dateSelectionContainer.style.display = 'none';
          submitButtonContainer.style.display = 'none';
        }
      })
      .catch(function(error) {
        // Error handling for query execution
        observablePropertiesContainer.innerHTML = '';

        var message = document.createElement('p');
        message.textContent = 'Error retrieving observable properties.';
        observablePropertiesContainer.appendChild(message);

        dateSelectionContainer.style.display = 'none';
        submitButtonContainer.style.display = 'none';

        console.error(error);
      });
  });

  // Event listener for submit button click
  submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    if (patientForm.checkValidity()) {
      // Get the selected patient, observable property, start date, and end date
      var selectedPatient = patients[selectedPatientIndex];
      var selectedObservablePropertyURI = observablePropertiesContainer.querySelector('input[name="observableProperty"]:checked').value;
      var selectedObservableProperty = getObsNameFromURI(selectedObservablePropertyURI);
      var startDate = startDateInput.value;
      var endDate = new Date(endDateInput.value);
      endDate.setDate(endDate.getDate() + 1);
      endDate = endDate.toISOString().split('T')[0];

      // SPARQL query to display data for the selected patient, observable property, and date range
      var sparqlQuery = `PREFIX sosa: <http://www.w3.org/ns/sosa/>
                         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                         PREFIX sosa-foi: <http://www.w3.org/ns/sosa/FeatureOfInterest/>
                         PREFIX sosa-obs-prop: <http://www.w3.org/ns/sosa/ObservableProperty/>
                         PREFIX qudt: <http://qudt.org/schema/qudt/>
                         PREFIX time: <http://www.w3.org/2006/time#>
                         PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

                         SELECT ?startTime ?endTime ?date ?value (?unitSymbol AS ?Unit) WHERE {
                           ?obs sosa:observedProperty sosa-obs-prop:${selectedObservableProperty}.
                           ?obs sosa:hasFeatureOfInterest sosa-foi:${selectedPatient}.
                           ?obs sosa:phenomenonTime ?time.
                           {
                             ?obs sosa:hasResult ?result.
                             ?result qudt:numericValue ?value.
                             ?result qudt:unit ?unit.
                             ?unit qudt:symbol ?unitSymbol.
                             ?time time:inXSDDateTimeStamp ?date.
                             FILTER(?date >= "${startDate}"^^xsd:dateTime && ?date <= "${endDate}"^^xsd:dateTime).
                           } UNION {
                             ?obs sosa:hasResult ?result.
                             ?result qudt:numericValue ?value.
                             ?result qudt:unit ?unit.
                             ?unit qudt:symbol ?unitSymbol.
                             ?time time:hasBeginning ?start.
                             ?time time:hasEnd ?end.
                             ?start time:inXSDDateTimeStamp ?startTime.
                             ?end time:inXSDDateTimeStamp ?endTime.
                             FILTER(?startTime >= "${startDate}"^^xsd:dateTime && ?endTime <= "${endDate}"^^xsd:dateTime).
                           } UNION {
                             ?obs sosa:hasSimpleResult ?value.
                             ?time time:hasBeginning ?start.
                             ?time time:hasEnd ?end.
                             ?start time:inXSDDateTimeStamp ?startTime.
                             ?end time:inXSDDateTimeStamp ?endTime.
                             FILTER(?startTime >= "${startDate}"^^xsd:dateTime && ?endTime <= "${endDate}"^^xsd:dateTime).
                           }
                         }
                         ORDER BY (?endTime) (?date)`;

      // Log the selected options and SPARQL query
      console.log('Selected Patient:', selectedPatient);
      console.log('Selected Observable Property:', selectedObservableProperty);
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
      console.log('SPARQL Query:', sparqlQuery);

      // Display the SPARQL results as a table
      displaySPARQLTable(sparqlQuery);
    }
  });

  // Event listener for back button click
  backButton.addEventListener('click', function() {
    // Reset the UI and clear previous selections
    selectedPatientIndex = -1;
    patientSelect.value = '';
    patientSelect.disabled = false;
    pageTitle.textContent = 'Choose patient';
    observablePropertiesContainer.innerHTML = '';
    dateSelectionContainer.style.display = 'none';
    submitButtonContainer.style.display = 'none';

    // Reset the custom select dropdown
    var customSelect = patientSelect.nextElementSibling;
    if (customSelect && customSelect.classList.contains('custom-select')) {
      customSelect.querySelector('.custom-select-trigger').textContent = 'Choose patient...';
      var options = customSelect.querySelectorAll('.custom-option');
      options.forEach(function(option) {
        option.classList.remove('selected');
      });
    }

    // Reset form validation state
    patientForm.classList.remove('was-validated');

    // Remove any existing table
    var existingTable = document.getElementById('sparqlTable');
    if (existingTable) {
      existingTable.parentNode.removeChild(existingTable);
    }

    // Remove the line graph
    var chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = '';
  });

  // Function to extract the name from a URI
  function getNameFromURI(uri) {
    var lastIndex = uri.lastIndexOf('/');
    return uri.substring(lastIndex + 1);
  }

  // Function to extract the observable property name from a URI
  function getObsNameFromURI(uri) {
    var fragments = uri.split('/');
    return fragments[fragments.length - 1];
  }

  // Function to display the SPARQL results as a table
  function displaySPARQLTable(sparqlQuery) {
    // Fetch the SPARQL results from the repository
    fetch(repositoryURL + '/repositories/' + repositoryId, {
      method: 'POST',
      headers: {
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/sparql-query',
      },
      body: sparqlQuery,
    })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to execute the SPARQL query.');
        }
        return response.json();
      })
      .then(function(data) {
        // Create a table element
        var table = document.createElement('table');
        table.classList.add('table', 'table-bordered');

        // Create the table header
        var thead = document.createElement('thead');
        var headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create the table body
        var tbody = document.createElement('tbody');
        if (data.results.bindings.length > 0) {
          var emptyColumns = new Set();
          var chartData = {
            labels: [], // Time values for x-axis
            datasets: [], // Data values for y-axis
          };

          // Process the query results and populate the table rows
          for (var i = 0; i < data.results.bindings.length; i++) {
            var result = data.results.bindings[i];
            var columnCount = 0;

            for (var key in result) {
              if (result.hasOwnProperty(key)) {
                var value = result[key].value;
                var columnIndex = columnCount++;

                if (!value) {
                  emptyColumns.add(columnIndex);
                }

                var th = thead.querySelector('th:nth-child(' + (columnIndex + 1) + ')');
                if (!th) {
                  th = document.createElement('th');
                  headerRow.appendChild(th);
                }
                th.textContent = key;
              }
            }

            var row = document.createElement('tr');
            tbody.appendChild(row);

            for (var j = 0; j < columnCount; j++) {
              var cell = document.createElement('td');
              var cellValue = result[headerRow.children[j].textContent];
              cell.textContent = cellValue ? cellValue.value : '';
              row.appendChild(cell);
            }

            // Add data points for line graph
            var numericValue = result.value ? result.value.value : '';
            var endTimeValue = result.endTime ? result.endTime.value : '';
            var dateValue = result.date ? result.date.value : '';

            if (numericValue) {
              if (endTimeValue) {
                chartData.labels.push(endTimeValue);
              } else if (dateValue) {
                chartData.labels.push(dateValue);
              }
              chartData.datasets.push(parseFloat(numericValue));
            }
          }

          // Remove empty columns from the table
          emptyColumns.forEach(function(columnIndex) {
            var th = thead.querySelector('th:nth-child(' + (columnIndex + 1) + ')');
            th.parentNode.removeChild(th);

            var tds = tbody.querySelectorAll('tr td:nth-child(' + (columnIndex + 1) + ')');
            for (var k = 0; k < tds.length; k++) {
              tds[k].parentNode.removeChild(tds[k]);
            }
          });
        } else {
          // No results found
          var emptyRow = document.createElement('tr');
          var emptyCell = document.createElement('td');
          emptyCell.setAttribute('colspan', '1');
          emptyCell.textContent = 'No results found.';
          emptyRow.appendChild(emptyCell);
          tbody.appendChild(emptyRow);
        }

        // Append the table body to the table element
        table.appendChild(tbody);

        // Remove any existing table and append the new table to the page
        var existingTable = document.getElementById('sparqlTable');
        if (existingTable) {
          existingTable.parentNode.removeChild(existingTable);
        }
        document.getElementById('healthDataPage').appendChild(table);
        table.id = 'sparqlTable';

        // Display the line graph
        displayLineGraph(chartData);
      })
      .catch(function(error) {
        // Error handling for query execution
        console.error(error);
      });
  }

  // Helper function to display the line graph
  function displayLineGraph(chartData) {
    var chartContainer = document.getElementById('chartContainer');

    // Remove any existing graph
    chartContainer.innerHTML = '';

    // Create a canvas element for the graph
    var canvas = document.createElement('canvas');
    canvas.id = 'lineChart';
    chartContainer.appendChild(canvas);

    // Create the line graph
    var ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels.map(function(dateString) {
          var date = new Date(dateString);
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          });
        }),
        datasets: [{
          label: 'Value',
          data: chartData.datasets,
          borderColor: 'rgba(0, 123, 255, 1)',
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          tension: 0.4,
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value',
            },
          },
        },
      },
    });
  }
});
