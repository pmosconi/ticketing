export $(egrep -v '^#' .env.local | xargs)
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=$JWT_KEY
skaffold dev

# thisisunsafe

#debug
# https://medium.com/collaborne-engineering/remote-debug-nodejs-in-kubernetes-with-vs-code-d0282eae4388