import logging
import json

from tachyonic.neutrino import constants as const
from tachyonic.neutrino.wsgi import app
from tachyonic.neutrino.wsgi import router
from tachyonic.neutrino.client import Client
from tachyonic.neutrino.html.document import Document as HTMLDocument

log = logging.getLogger(__name__)


def _compile_response(result, api_fields, search, keywords_mode):
    """ Function _compile_response

    Used to generate the list of dicts that will become the
    JSON response that jquery autocomplete expects.

    Args:
        result (list): List of dict objects received from querying the API.
        api_fields (list): List of fields to be included in the final response.
        search (str): The search string.
        keywords_mode (bool): If set to True, response will only contain fields that contain the search string.

    Returns:
         List of dicts in the format that jquery autocomplete expects
    """
    response = []
    for row in result:
        record = {'id': row['id'] if 'id' in row else '',
                  'value': []}
        for api_field in api_fields:
            field, name = api_field.split("=")
            if keywords_mode:
                if row[field] is not None:
                    if search.lower() in row[field].lower():
                        record['id'] = record['id']
                        record['label'] = row[field]
                        record['value'] = row[field]
            else:
                record[field] = row[field]
                if name is not None and name != 'None':
                    record['value'].append("%s" % row[field])
        if type(record['value']) == list:
            record['value'] = " ".join(record['value'])
            record['label'] = record['value']
        response.append(record)
    return response


def select(req,
           field_id,
           url=None,
           fields=None,
           keywords_mode=False,
           placeholder=None,
           select=None,
           change=None,
           source=None):
    """Function select

    Used for generating the HTML for an input field, as
    well as the jquery script required for autocompletion.

    Args:
        req (object): Request Object (tachyonic.neutrino.wsgi.request.Request).
        field_id (str): HTML id attribute of the input field.
        url (str): the api url from which the ajax data is to be retrieved.
        fields (OrderedDict): Mapping of API response fields to HTML attribute names
        keywords_mode (bool): If set to True, response will only contain fields that contain the search string.
        placeholder (str): Placeholder of the <input> field.
        select (str): javascript to be run when item is selected.
        change (str): javascript to be run when item is changed.
        source (str): Alternative source to use than Tachyonic /select

    Returns:
        object of Class tachyonic.neutrino.web.dom.HTMLDocument containing the html and javasript required
        to perform the jquery autocomplete.
    """
    dom = HTMLDocument()

    i = dom.create_element('input')
    i.set_attribute('id', field_id)
    i.set_attribute('name', field_id)
    i.set_attribute('class', 'form-control')
    if placeholder is not None:
        i.set_attribute('placeholder', placeholder)

    api_fields = []
    if fields is not None:
        for field in fields:
            api_fields.append("%s=%s" % (field, fields[field]))

        api_fields = ",".join(api_fields)

    js = "$(\"#%s\").autocomplete({" % (field_id,)
    if source is not None:
        js += "source: %s," % source
    elif keywords_mode is True:
        js += "source: '%s/select/?api=%s&fields=%s&keywords_mode=1'," % (req.app, url, api_fields)
    else:
        js += "source: '%s/select/?api=%s&fields=%s'," % (req.app, url, api_fields)

    js += "minLength: 3,"
    js += "position: { my : \"right top\", at: \"right bottom\" },"
    if select is not None:
        js += "select: function(event, ui) {"
        js += select
        js += "},"
    if change is not None:
        js += "change: function(event, ui) {"
        js += change
        js += "},"
    js += "open: function(event, ui) {"
    js += "$(\".ui-autocomplete\").css(\"z-index\", 10000);"
    js += "}"
    js += "});"

    s = dom.create_element('script')
    s.append(js)

    return str(dom.get())


@app.resources()
class Select(object):
    """class Select

    Adds and processes GET requests to the /select routes, which is
    the URI used by Tachyonic input field to select Tenants.

    """
    def __init__(self):
        router.add(const.HTTP_GET, '/select', self.select, 'tachyonic:public')

    def select(self, req, resp):
        """ method select(req, resp)

        Process GET requests to /select URI's by calling the API URI
        with the appropriate values for the headers X-Pager-Start and X-Pager-Limit.

        Args:
            req (object): Request Object (tachyonic.neutrino.wsgi.request.Request).
            resp (object): Response Object (tachyonic.neutrino.wsgi.response.Response).

        Returns:
            JSON object used to render the contents of jquery autocomplete.
        """
        resp.headers['Content-Type'] = const.APPLICATION_JSON
        url = req.query.getlist('api', [''])
        api_fields = req.query.getlist('fields', [''])
        api_fields = api_fields[0].split(",")
        search = req.post.get('term', None)
        api = Client()
        request_headers = {'X-Pager-Start': "0",
                           'X-Pager-Limit': "25",
                           'X-Search': search}
        response_headers, result = api.execute(const.HTTP_GET, url[0],
                                               headers=request_headers)

        if 'keywords_mode' in req.post:
            keywords_mode = True
        else:
            keywords_mode = False

        response = _compile_response(result, api_fields, search, keywords_mode)

        return json.dumps(response, indent=4)
