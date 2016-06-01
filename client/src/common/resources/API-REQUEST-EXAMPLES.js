//EXECUTE A JOB
data = JSON.stringify({
  "workflow_id": "b472e2eb553fa0d1",
  "history": "history_id=7b668ee810f6cf46",
  "ds_map": {
    "0": {"src": "hda", "id": "72ad249754f05d26"}
  },
  "parameters": {
    "1" : {
      "exp" : "asdsa",
      "iterate" : true
    }
  }
})

$.ajax({
  type: "POST", contentType: 'application/json; charset=utf-8',
  url : "http://192.168.0.99/galaxy/api/workflows/b472e2eb553fa0d1/invocations",
  data:data
});

//GET HISTORY CONTENT
http://192.168.0.99/galaxy/api/histories/7b668ee810f6cf46/contents

//GET WORKFLOW COTENTS
http://192.168.0.99/galaxy/api/workflows/b472e2eb553fa0d1/download
http://192.168.0.99/galaxy/api/workflows/b472e2eb553fa0d1/invocations
