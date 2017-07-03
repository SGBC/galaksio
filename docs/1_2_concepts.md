<div class="imageContainer" style="" >
    <img src="galaksio_logo.png" title="Galaksio logo." style=" height: 70px !important; margin-bottom: 20px; ">
</div>


# Must know concepts
- [What is a Workflow in Galaxy?](#what-is-a-workflow-in-galaxy?)
- [Datasets in Galaxy](#datasets-in-galaxy)
- [Histories in Galaxy](#histories-in-galaxy)

Note: Part of this content has been Extracted from the [Galaxy project documentation](https://galaxyproject.org/learn).

## What is a Workflow in Galaxy?
* A workflow is a series of tools and dataset actions that run in sequence as a batch operation.
* Workflows can be created from scratch using the workflow editor.
* Workflows can be annotated, viewed, shared, published, and imported - just like other Galaxy objects.
* Any workflow that you have permissions to import, you can modify with the workflow editor.
* Workflow can be reused over and over, not only reducing tedious work, but enhancing reproducibility by applying the same exact methods to all of your data.
More information about workflows, [here](https://galaxyproject.org/learn/advanced-workflow/).


<div class="imageContainer" style="text-align:center;" >
    <img src="galaxy_workflows.png" title="Galaxy workflows." style="height: 350px !important; margin-bottom: 20px; ">
    <p class="imageLegend" style="font-size:10px;">Figure 1. Creating a workflow in Galaxy using the workflow editor.</p>
</div>

## Datasets in Galaxy
Datasets are the inputs and outputs of each step in an analysis project in Galaxy. The tracking information associated with Datasets in a History represent an experimental record of the methods, parameters, and other inputs.

## Histories in Galaxy
When data is uploaded from your computer or analysis is done on existing data using Galaxy, each output from those steps generates a dataset. These datasets (and the output datasets from subsequent analysis on them) are stored by Galaxy in Histories.

**The Current History**

All users have one 'current' history, which can be thought of as a workspace or a current working directory in bioinformatics terms. You current history is displayed in the right hand side of the main 'Analyze Data' Galaxy interface in what is called the history panel.

The history panel displays output datasets in the order in which they were created with the oldest/first shown at the bottom. As new analyses are done and new output datasets are generated, the newest datasets are added to the top of the history panel. In this way, the history panel displays the history of your analysis over time.

Users that have registered an account and logged in can have many histories and the history panel allows switching between them and creating new ones. This can be useful to organize different analyses.

<div class="imageContainer" style="text-align:center;" >
    <img src="galaxy_histories.png" title="Galaxy histories." style="height: 350px !important; margin-bottom: 20px; ">
    <p class="imageLegend" style="font-size:10px;">Figure 2. Galaxy history is simply the right panel of the interface.</p>
</div>

## Dataset collections
Collection are designed to simplify complex, multi-sample analyses. In Galaxy you perform data analyses and organize your data simply by clicking on things. In real-world analyses you never have just a few datasets, instead you have many (sometimes thousands) and Collections help manage your data to minimize the amount of clicking you have to do.

[More info](https://galaxyproject.org/tutorials/collections/)
