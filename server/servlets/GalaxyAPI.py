"""
# (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
# (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the GNU Lesser General Public License
# (LGPL) version 3 which accompanies this distribution, and is available at
# http://www.gnu.org/licenses/lgpl.html
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# Lesser General Public License for more details.
#
# Contributors:
#     Rafael Hernandez de Diego <rafahdediego@gmail.com>
#     Tomas Klingstrom
#     Erik Bongcam-Rudloff
#     and others.
#
"""
from os import path as osPath

from bioblend.galaxy import GalaxyInstance


def generateWorkflowReport(request, settings):
    # Get the invocation and workflow data
    invocation = request.json.get("invocation")
    workflow = request.json.get("workflow")

    # Open a new connection with bioblend
    galaxy_key = request.values.get("key")
    gi = GalaxyInstance(settings.GALAXY_SERVER, galaxy_key)

    workflow_steps = {}
    for step in workflow.get("steps"):
        workflow_steps[step.get("uuid")] = step

    for step in invocation.get("steps"):
        workflow_step = workflow_steps[step.get("workflow_step_uuid")]
        workflow_step["state"] = step.get("state")
        workflow_step["job_id"] = step.get("job_id")
        workflow_step["job"] = gi.jobs.show_job(step.get("job_id"))

    # GENERATE THE HTML
    html_code = ""
    to_close_tags = []

    html_code += addTag("h2", "Workflow details", "font-size: 30px; color:red")
    html_code += getEntryLine("Workflow name", workflow.get("name"), "font-size: 30px; color:red")
    html_code += openNewSection("div", "font-size: 20px;", to_close_tags)
    html_code += getEntryLine("Workflow name", workflow.get("name"), "font-size: 30px; color:red")
    html_code += getEntryLine("Owner", workflow.get("owner"))
    html_code += getEntryLine("Run date", invocation.get("update_time"))
    html_code += closeSection(to_close_tags)

    html_code += addTag("h2", "Steps details", "font-size: 30px; color:red")
    html_code += openNewSection("div", "font-size: 16px;", to_close_tags)

    for step in sorted(list(workflow_steps.values()), key=lambda k: k['id']):
        html_code += openNewSection("div", "font-size: 14px;", to_close_tags)
        html_code += addTag("h3", "Step" + str(step.get("id")) + ". " + step.get("name"), "font-size: 30px; color:red")
        html_code += addTag("b", "Inputs")

        if step.get("type") == "data_input":
            pass
        else:
            try:
                html_code += getEntryLine("Inputs", str(step.get("inputs")))
            except Exception:
                pass

            html_code += addTag("b", "Params")
            try:
                html_code += getEntryLine("Inputs", str(step.get("job")))
            except Exception:
                pass

        html_code += closeSection(to_close_tags)

    html_code += closeSection(to_close_tags)

    from fpdf import FPDF, HTMLMixin

    class MyFPDF(FPDF, HTMLMixin):
        pass

    pdf = MyFPDF()
    # First page
    pdf.add_page()
    pdf.write_html(html_code)
    tmp_path = osPath.join(settings.TMP_DIRECTORY, "report.pdf")
    pdf.output(tmp_path, 'F')

    return tmp_path


def getEntryLine(label, value, style=""):
    return "<p style='" + style + "'><b>" + label + ": </b>" + value + "</p>"


def addTag(type, text, style=""):
    return "<" + type + " style='" + style + "'>" + text + "</" + type + ">"


def openNewSection(type, style, to_close_tags):
    to_close_tags.append(type)
    return "<" + type + " style='" + style + "'>"


def closeSection(to_close_tags):
    tag = to_close_tags.pop()
    return "</" + tag + ">"
