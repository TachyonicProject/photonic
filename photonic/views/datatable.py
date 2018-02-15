
from luxon import g
from luxon import js as json
from luxon import constants as const
from luxon.structs.htmldoc import HTMLDoc
from luxon import GetLogger
from luxon import register_resources

log = GetLogger(__name__)


def datatable(req, table_id, url,
              fields, width='100%', view_button=False,
              checkbox=False, service=False,
              endpoint=None, id_field=None,
              search='', sort=''):
    """
    Function datatable.

    Used by views to generate the HTML/javascript for a Datatable

    Example Usage:
        fields = OrderedDict([('name', 'Role'), ('description', 'Description')])
        fields = List(name, description, etc)
        dt = datatable(req, 'roles', '/v1/roles', fields, view_button=True)

    Args:
        req (object): Request Object (tachyonic.neutrino.wsgi.request.Request).
        table_id (str): html id of the table.
        url (str): the api url from which the ajax data is to be retrieved.
        fields (OrderedDict): dictionary of fields and their <th> to be included in the datatable.
        width (str): width of the datatable.
        view_button (bool): Wehther or not to include the view icon/url in the datatable.
        checkbox (bool): Whether or not to include the a checkbox in the datatable.
        service (bool): Whether or not to to display in the service area.
        endpoint (str): The Tachyonic endpoint to query.
        id_field (int): The number of the column for which the id should be obtained
        search (str): Search string to be supplied to datatables.
        sort (tuple): (int, str) where int is the column number, and str is order (desc/asc) to default sort on

    Returns:
        object of Class tachyonic.neutrino.web.dom.HTMLDocument containing the table html and javasript required
        to render the jquery Datatable
    """
    dom = HTMLDoc()
    table = dom.create_element('table')
    table.set_attribute('id', table_id)
    table.set_attribute('class', 'display')
    table.set_attribute('style', "width:%s;" % (width,))

    thead = table.create_element('thead')
    tr = thead.create_element('tr')
    api_fields = []
    for field in fields:
        th = tr.create_element('th')
        th.append(field.title())
        api_fields.append("%s=%s" % (field, field.title()))
    if view_button is True or checkbox is True:
        th = tr.create_element('th')
        th.append('&nbsp;')
        api_fields.append("%s=%s" % ('id', 'id'))
    if id_field is None:
        id_field_no = len(api_fields) - 1
    else:
        id_field_no = id_field

    field_name = api_fields[id_field_no]
    field_name = field_name.split('=')[0]
    api_fields = ",".join(api_fields)

    tfoot = table.create_element('tfoot')
    tr = tfoot.create_element('tr')
    for field in fields:
        th = tr.create_element('th')
        th.append(field.title)
    if view_button is True or checkbox is True:
        th = tr.create_element('th')
        th.append('&nbsp;')
    if search:
        q = search
        search = "'search': {"
        search += "'search': '%s'" % (q,)
        search += '},'
    if sort:
        sort = "'order': [[%s, '%s']]," % (sort[0], sort[1])

    js = "$(document).ready(function() {"
    js += "var table = $('#%s').DataTable( {" % (table_id,)
    js += "'processing': true,"
    js += search
    js += sort
    js += "'serverSide': true,"
    js += "'ajax': '%s/datatable/?api=%s&fields=%s" % (req.app, url, api_fields)
    if endpoint:
        js += "&endpoint=%s'" % (endpoint,)
    else:
        js += "'"
    if view_button is True:
        js += ",\"columnDefs\": ["
        js += "{\"targets\": -1,"
        js += "\"data\": null,"
        js += "\"width\": \"26px\","
        js += "\"orderable\": false,"
        js += "\"defaultContent\":"
        js += " '<button class=\"view_button\"></button>'"
        js += "}"
        js += "]"
        js += "} );"
        res = ""#ui.resource(req)
        js += "$('#%s tbody')" % (table_id,)
        js += ".on( 'click', 'button', function () {"
        js += "var data = table.row( $(this).parents('tr') ).data();"
        if service is False:
            js += "ajax_query(\"#window_content\","
            js += "\"%s/%s/view/\"+data[%s]);" % (req.get_app(), res, id_field_no)
        else:
            js += "ajax_query(\"#service\","
            js += "\"%s/%s/view/\"+data[%s]);" % (req.get_app(), res, id_field_no)
    elif checkbox is True:
        js += ",\"columnDefs\": ["
        js += "{\"targets\": -1,"
        js += "\"data\": null,"
        js += "\"width\": \"26px\","
        js += "\"orderable\": false,"
        js += "\"render\":"
        js += " function ( data, type, row ) {"
        js += "if ( type === 'display' ) {"
        js += "return '<input type=\"checkbox\" "
        js += "name=\"%s\" value=\"' + row[%s] + '\">';" % (field_name, id_field_no)
        js += "}; return data;"
        js += "}"
        js += "}"
        js += "]"

    js += "} );"

    js += "} );"
    script = dom.create_element('script')
    script.append(js)

    return dom.get()


@register_resources()
class DataTables(object):
    """class Datatables

    Adds and processes requests to the /dt routes, which is
    the URI used by all Tachyonic datatables for AJAX queries.

    """
    def __init__(self):
        g.router.add(const.HTTP_GET, '/datatable', self.datatable)
        g.router.add(const.HTTP_POST, '/datatable', self.datatable)

    def datatable(self, req, resp):
        """ method datatable(req, resp)

        Process GET and POST requests to /dt URI's by calling the API URI
        with the appropriate values for the headers X-Pager-Start, X-Pager-Limit
        and X-Order-By.

        Args:
            req (object): Request Object (tachyonic.neutrino.wsgi.request.Request).
            resp (object): Response Object (tachyonic.neutrino.wsgi.response.Response).

        Returns:
            JSON object used to render the contents of the Datatable.
        """
        resp.headers['Content-Type'] = const.APPLICATION_JSON
        url = req.query.get('api')
        api_fields = req.query.getlist('fields', [''])
        api_fields = api_fields[0].split(",")
        endpoint = req.query.get('endpoint', None)
        draw = req.query.getlist('draw', ["0"])
        start = req.query.getlist('start', ["0"])
        length = req.query.getlist('length', ["0"])
        search = req.query.getlist('search[value]', [None])
        order = req.query.getlist("order[0][dir]")
        column = req.query.getlist("order[0][column]")
        count = 0
        orderby = None
        if order is not None and column is not None:
            order = order[0]
            column = column[0]
            for api_field in api_fields:
                if column == str(count):
                    order_field, order_field_name = api_field.split('=')
                    orderby = "%s %s" % (order_field, order)
                count += 1
        request_headers = {'X-Pager-Start': start[0], 'X-Pager-Limit': length[0]}
        if orderby is not None:
            request_headers['X-Order-By'] = orderby

        if search[0] is not None:
            request_headers['X-Search'] = search[0]
        response_headers, result = g.client.execute(const.HTTP_GET, url,
                                                    headers=request_headers,
                                                    endpoint=endpoint)
        recordsTotal = int(response_headers.get('X-Total-Rows', 0))
        recordsFiltered = int(response_headers.get('X-Filtered-Rows', 0))
        response = {
            'draw': int(draw[0]),
            'recordsTotal': recordsTotal,
            'recordsFiltered': recordsFiltered
        }
        data = []
        for row in result:
            fields = []
            for api_field in api_fields:
                field, name = api_field.split("=")
                fields.append(row[field])
            data.append(fields)
        response['data'] = data
        return json.dumps(response, indent=4)
