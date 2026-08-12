import test from "node:test";
import assert from "node:assert/strict";
import { FgetClient, type Answer, type VideoResult } from "../src/index.ts";

const BASE = process.env.FGET_INSTANCE ?? "http://localhost:8888";
const client = new FgetClient(BASE);

const reachable = (async () => {
  try {
    await client.ami4get();
    return true;
  } catch {
    return false;
  }
})();

test("ami4get", async (t) => {
  if (!(await reachable)) return t.skip(`instance ${BASE} unreachable`);
  const ami = await client.ami4get();
  assert.equal(ami.status, "ok");
  assert.equal(ami.service, "4get");
  assert.ok(Array.isArray(ami.instances));
});

test("web search + typed answers + npt pagination", async (t) => {
  if (!(await reachable)) return t.skip(`instance ${BASE} unreachable`);
  const page1 = await client.web({ s: "higurashi", extendedsearch: true });
  assert.equal(page1.status, "ok");
  assert.ok(typeof page1.npt === "string");
  assert.ok(Array.isArray(page1.web));
  assert.ok(Array.isArray(page1.answer));
  if (page1.answer.length > 0) {
    const ans: Answer = page1.answer[0];
    assert.equal(typeof ans.title, "string");
    assert.ok(Array.isArray(ans.description));
  }

  const page2 = await client.web({ npt: page1.npt! });
  assert.equal(page2.status, "ok");
  assert.ok(Array.isArray(page2.web));
});

test("images / videos / news / music / autocomplete", async (t) => {
  if (!(await reachable)) return t.skip(`instance ${BASE} unreachable`);

  const images = await client.images({ s: "higurashi" });
  assert.equal(images.status, "ok");
  assert.ok(Array.isArray(images.image));

  const videos = await client.videos({ s: "higurashi" });
  assert.equal(videos.status, "ok");
  if (videos.video.length > 0) {
    const v: VideoResult = videos.video[0];
    assert.equal(typeof v.title, "string");
    assert.ok(Array.isArray(v.thumb) === false);
  }

  const news = await client.news({ s: "higurashi" });
  assert.equal(news.status, "ok");
  assert.ok(Array.isArray(news.news));

  const music = await client.music({ s: "higurashi" });
  assert.equal(music.status, "ok");
  assert.ok(Array.isArray(music.song));

  const ac = await client.autocomplete("higurashi");
  assert.equal(ac[0], "higurashi");
  assert.ok(Array.isArray(ac[1]));
});
