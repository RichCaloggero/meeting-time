function renderList (list) {
return `<ul>
${list.map(x => `<li>${x}</li>\n`).join("")}
</ul>
`;
} // renderList

function renderTable (list, _headers) {
if (list instanceof Array && list.length > 0) {
const headers = _headers? _headers : Object.keys(list[0]);

return `<table><thead>
${renderRow(headers)}
</thead><tbody>
${list.map(row => renderRow(row, headers)).join("")}
</tbody></table>
`;
} // if

function renderRow (list, headers) {
return `<tr>
${headers? headers.map(key => `<td>${list[key]}</td>`).join("")
: list.map(header => `<th>${header}</th>`).join("")}
</tr>
`;
} // renderRow
} // renderTable

renderTable([{int:2,square:4},{int:3,square:9}], ["int","square"]);
