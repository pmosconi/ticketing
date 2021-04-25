export $(egrep -v '^#' .env.local | xargs)
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=$JWT_KEY
skaffold dev

# thisisunsafe