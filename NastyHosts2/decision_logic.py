import tornado.ioloop
import tornado.httpserver
import tornado.web
import tornado.httpclient
import json
import os

facadeUrl = os.getenv("facadeUrl", "http://127.0.0.1:3000/")


class MainHandler(tornado.web.RequestHandler):

    def process(self, response):
        data = json.loads(response.body)
        result = {"suggestion" : "allow/deny", "factor" : 123}
        self.send(result)

    @tornado.web.asynchronous
    def get(self, url):

        request = tornado.httpclient.HTTPRequest(facadeUrl+url)
        http_client = tornado.httpclient.AsyncHTTPClient()
        http_client.fetch(request, callback=self.process)

    def send(self, result):
        self.write(result)
        self.finish()

app = tornado.web.Application([
        (r"/([^/]+)", MainHandler),
    ])

if __name__ == '__main__':
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(5001)
    tornado.ioloop.IOLoop.current().start()
