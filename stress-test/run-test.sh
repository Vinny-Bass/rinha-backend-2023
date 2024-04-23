# Exemplos de requests
# curl -v -XPOST -H "content-type: application/json" -d '{"nickname" : "xpto", "name" : "xpto xpto", "birth" : "2000-01-01", "stack": null}' "http://localhost:9999/person"
# curl -v -XGET "http://localhost:9999/person/1"
# curl -v -XGET "http://localhost:9999/person?t=xpto"
# curl -v "http://localhost:9999/person-count"

GATLING_BIN_DIR=$HOME/gatling/bin

WORKSPACE=$HOME/test/rinha-backend/stress-test

sh $GATLING_BIN_DIR/gatling.sh -rm local -s RinhaBackendSimulation \
    -rd "DESCRICAO" \
    -rf $WORKSPACE/user-files/results \
    -sf $WORKSPACE/user-files/simulations \
    -rsf $WORKSPACE/user-files/resources \

sleep 3

# curl -v "http://localhost:9999/person-count"
# curl -v "http://localhost:9999/contagem-pessoas"