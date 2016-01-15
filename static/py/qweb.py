from qgis.core import *


class QWeb:
    def __init__(self, iface):
        self.iface = iface
        self.canvas = self.iface.mapCanvas()

    def msg(self, request):
        self.iface.messageBar().pushInfo("Qweb msg", request.query["content"])
        return "Message pusehd"

    def extent(self, request):
        bbox = request.query.get("bbox", None)
        if bbox:
            extent = QgsRectangle(*[float(i) for i in bbox.split(",")])
            self.canvas.setExtent(extent)
        return self.canvas.extent().asWktCoordinates()

    def add(self, request):
        return request.query["a"] + request.query["b"]
