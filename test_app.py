import json, os
import app


def test_projects_empty_without_file(tmp_path, monkeypatch):
    monkeypatch.setattr(app, "DATA", tmp_path / "projects.json")
    assert app.projects() == []


def test_save_keeps_latest_20(tmp_path, monkeypatch):
    monkeypatch.setattr(app, "DATA", tmp_path / "projects.json")
    for i in range(21): app.save({"title": str(i)})
    data = json.loads(app.DATA.read_text())
    assert len(data) == 20 and data[0]["title"] == "20"


def test_topic_limit():
    assert len("x" * 500) == 500
