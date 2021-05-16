PORT=$1
POD=$(kubectl get pods --no-headers -o custom-columns=":metadata.name" | grep nats-depl)
echo $POD
kubectl port-forward $POD $PORT:$PORT
