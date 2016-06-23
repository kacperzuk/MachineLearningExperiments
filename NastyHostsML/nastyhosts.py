import tornado.ioloop
import tornado.httpserver
import tornado.web
import tornado.httpclient
import json
import os
import decision_logic


facadeUrl = os.getenv("facadeUrl", "http://127.0.0.1:3000/")

class MainHandler(tornado.web.RequestHandler):

    def handle_response(self, url, response):
        if response.error:
            data = response.error
            result = {"status" : "error", "error" : data}
            self.send(result)
        else:
            data = response.body
            data = json.loads(data)
            result = decision_logic.process(url, data)
            self.send(result)

    @tornado.web.asynchronous
    def get(self, url):
        request = tornado.httpclient.HTTPRequest(facadeUrl+url)
        http_client = tornado.httpclient.AsyncHTTPClient()
        http_client.fetch(request, callback=lambda response: self.handle_response(url, response))

    def send(self, result):
        self.write(result)
        self.finish()

app = tornado.web.Application([
        (r"/([^/]+)", MainHandler),
    ])

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(6000)
    tornado.ioloop.IOLoop.current().start()
