# IMPLEMENTATION LOG

## Phase1: 診断タイプ体系の型・元データ追加

- やったこと: `src/lib/diagnosis/types.ts` に `BoneType` / `FaceType` / `ColorSeason` と、画像単位の `Label` 型を追記。`src/data/boneTypes.ts` / `src/data/faceTypes.ts` / `src/data/colorSeasons.ts` を新規作成し、docs のタイプ体系案 §6/§7 とベースデータ判定基準の表を元データ化。
- 決めたこと: 表示名は Line / Pop / Sunrise などの独自名に統一し、標準名は `standardEquivalent` に保持。顔タイプの2軸メタは `axis.childAdult` と `axis.curveStraight` に保持。表示用 `copy` は「傾向が見られます」「寄りに見えます」の非断定表現に限定。
- 次: Phase2 で候補スコアと `DiagnosisResult.confidences` への接続、写真条件によるカラー Confidence 低め運用、スタイリストラベル保存先との接続を行う。

## Phase2: 保存の器＝ラベル収集

- やったこと: `src/lib/diagnosis/types.ts` に `AgreementLog` / `ImageMeta` / `TrainingConsent` を追加し、`Label` に `labelId`、任意のひもづけ情報、`createdAt` / `updatedAt` を追加。`src/services/storage/labelStore.ts` を新規作成し、Labelの作成・取得・一覧・削除をメモリとブラウザlocalStorageで扱えるようにした。`docs/data-model.md` に Images拡張、Label、AgreementLog を追記。
- 決めたこと: MVPの保存層は `LabelStore` インターフェース越しに扱い、DBやSupabase Storageには接続しない。`create` 時に `labelId` と日時が未指定の場合はストア側で補完する。`trainingConsent` は画像保存同意とは別の状態として持つ。
- 次: スタイリスト・ラベリング画面から `source='stylist'` / `isGroundTruth=true` のLabelを生成し、画像単位で `hasGroundTruth` と `primaryLabelIds` を更新できる入口を作る。

## Phase3: スタイリスト・ラベリング画面

- やったこと: `src/app/admin` をスタイリスト向けラベリングMVPに差し替え、左に仮画像キューと撮影条件、右に骨格・顔・カラーのタブ式クイック入力を実装。観測特徴を選ぶと既存の `boneTypes` / `faceTypes` / `colorSeasons` の `cues` と特徴重みから候補をスコア順に表示し、プロがタイプ・確信度・メモを確定できるようにした。保存時は3軸それぞれで `labelStore.create` を呼び、`source='stylist'` / `isGroundTruth=true` / `observedFeatures` 付きのLabelを生成して次の画像へ進める。
- 決めたこと: MVPではDBと実画像ストレージへ接続せず、`labelStore` のメモリ/localStorage保存と仮キューで「1枚に3軸ラベルを付けて保存→次へ」の操作確認を優先。顔タイプは2軸スライダーを基本特徴として保存し、詳細特徴は任意の根拠として追加する。
- 次: 実画像キューと `ImageMeta.hasGroundTruth` / `primaryLabelIds` の更新口を接続する。カラーの写真条件による判定保留フロー、ラベラーID入力、ショートカット操作、軸別・ラベラー別集計を追加する。

## Phase4: 利用者向け結果表示

- やったこと: `estimateDiagnosis` を、写真チェックと補助質問を入力にしたルールベース推定へ更新。`boneTypes` / `faceTypes` / `colorSeasons` のベース特徴を候補の初期根拠に使い、補助質問の回答でタイプ候補へ重み付けする構造にした。`src/data/styleRecommendations.ts` を追加し、タイプ体系案 §9 の「活かしやすい方向」を利用者向け提案データ化。`src/app/(diagnosis)/result` では、独自名、候補%、推定度、根拠、前向きな提案、注意書きを表示するように更新。
- 決めたこと: 写真が不足している場合は候補を表示しない。表示は非断定にし、写真条件により変わる可能性を明記する。Supabase、OpenAI Vision、DB、認証には接続しない。提案は「試しやすい方向」として扱い、禁止語を使わない。
- 次: 候補差が近い場合の追加写真・追加質問提案、写真条件が弱い軸の表示抑制、利用者フィードバック導線を追加する。

## Phase4 v2: 利用者向け結果表示の判定基準更新

- やったこと: `docs/AIスタイルLab_ベースデータ_判定基準_v2.md` に合わせ、`AxisResult` に `status` / `isMixed` / `isNeutral` / `featureSources` / 根拠グループ / 不足案内を追加。顔立ち傾向は `src/lib/diagnosis/faceMajority.ts` を新設し、縦軸7項目・横軸8項目の多数決で集計する形に変更。`unknown` は分母から外し、各軸の有効回答が3件未満なら `insufficient` として候補%を出さない。
- やったこと: 骨格傾向は `boneTypes.cues` を `{ text, observability }` に構造化し、写真由来と触れて分かる項目を分離。触れて分かる項目はご回答由来として補い、推定度の上限を70に設定。Frameの判定に重心を使わず、腰まわりの横方向の見え方も判定材料にしない構成へ変更。
- やったこと: カラー傾向は推定度の上限を55に設定し、上位2候補のベースがまたがる場合に `isNeutral` を立てるようにした。金属の見え方を判定材料や説明データから外し、注意書きに「照明・撮影条件・画像の加工により、色の見え方は変わります。」を入れた。
- やったこと: `src/app/(diagnosis)/result/page.tsx` は軸ごとの `estimated` / `insufficient` を表示し、候補%は `estimated` のみ表示。根拠は「写真から見た点」「ご回答から見た点」に分け、提案は推定できた軸だけから前向きに出すように変更。
- 確認: `npx tsc --noEmit`、`npm run lint`、`npm run build` は通過。指定された `src/` 文言検索もヒットなし。

## Phase4 v3: タイプ別イメージ画像の追加

- やったこと: 骨格傾向の Line / Curve / Frame 用に全身イメージ画像を生成し、`public/images/bone-types/` に保存。`src/data/boneTypes.ts` に `imageSrc` / `imageAlt` を追加し、結果画面の骨格候補カードへ表示するようにした。
- やったこと: カラー傾向の Sunrise / Mist / Amber / Midnight 用にカラーイメージ画像を生成し、`public/images/color-seasons/` に保存。`src/data/colorSeasons.ts` に `imageSrc` / `imageAlt` を追加し、結果画面のカラー候補カードへ表示できるようにした。
- 決めたこと: 表示には軽量化した `.jpg` を使い、生成元の `.png` も同じフォルダに残す。画像は診断の断定材料ではなく、お客様が傾向をイメージしやすくするための補助ビジュアルとして扱う。
- 次: 顔立ち傾向のタイプ別イメージ画像、タイプ比較ページ、結果カード内での画像サイズ・表示順の微調整を行う。

## Phase4 v4: カラータイプ別ギャラリー画像の追加

- やったこと: カラー傾向は1枚だけでは世界観が伝わりにくいため、Sunrise / Mist / Amber / Midnight それぞれに「着こなしイメージ」と「配色・素材イメージ」を追加生成。`public/images/color-seasons/gallery/` に保存し、軽量化した `.jpg` を表示用にした。
- やったこと: `src/data/colorSeasons.ts` に `imageGallery` を追加し、結果画面のカラー候補カードでメイン画像に加えて2枚の補助画像を表示するようにした。
- 決めたこと: カラー画像は診断の根拠ではなく、色の取り入れ方をイメージしやすくするための提案補助として扱う。顔が判別できる写真ではなく、匿名性のある着こなし・素材中心の画像にする。
- 次: 顔立ち傾向のイメージ画像追加、カラー候補カードの表示密度調整、タイプ別比較ページへの展開を行う。

## Phase4 v5: カラー別バリエーション画像の拡充

- やったこと: カラータイプごとに色幅が伝わる追加画像を2枚ずつ生成。Sunrise / Mist / Amber / Midnight それぞれで「色幅が分かるボード」と「日常に取り入れやすい配色」の2方向を追加した。
- やったこと: 追加画像を `public/images/color-seasons/gallery/` に保存し、軽量化した `.jpg` を `src/data/colorSeasons.ts` の `imageGallery` に追加。各カラータイプはメイン画像1枚 + ギャラリー4枚の構成になった。
- 決めたこと: カラーバリエーション画像は、診断結果を断定する材料ではなく、お客様が色の幅・素材感・日常への取り入れ方を直感的に理解するための補助ビジュアルとして扱う。
- 次: 画像枚数が増えたため、結果画面でのギャラリー表示を横スクロールや折りたたみ表示にするか検討する。

## Phase4 v6: 顔タイプ別イメージ画像の追加

- やったこと: 顔立ち傾向の Pop / Clear / Bloom / Mode それぞれに、匿名ポートレートのメイン画像と、スタイリング・ヘア小物の補助画像を生成。`public/images/face-types/` と `public/images/face-types/gallery/` に保存し、軽量化した `.jpg` を表示用にした。
- やったこと: `src/data/faceTypes.ts` に `imageSrc` / `imageAlt` / `imageGallery` を追加。`src/app/(diagnosis)/result/page.tsx` では顔タイプ候補にも画像を表示するようにした。
- 決めたこと: 顔タイプ画像は顔の正解例ではなく、曲線/直線・子ども/大人の印象をイメージしやすくする補助ビジュアルとして扱う。個人を特定できる顔写真ではなく、匿名性のある表現にする。
- 次: 画像が増えた結果カードの表示密度を確認し、必要に応じてギャラリーを横スクロールや折りたたみ表示に調整する。

## Phase4 v7: 顔タイプ画像を診断イメージ図へ差し替え

- やったこと: モザイク風の顔ポートレートでは、輪郭・パーツ配置・直線/曲線など「顔タイプ診断で何を見るのか」が伝わりにくいため、Pop / Clear / Bloom / Mode のメイン画像を抽象的な顔タイプ図解へ差し替えた。
- やったこと: 図解画像を `public/images/face-types/*-diagram.jpg` として追加し、`src/data/faceTypes.ts` の `imageSrc` を図解版へ変更。従来の雰囲気画像は削除せず、`imageGallery` の1枚目として残した。
- 決めたこと: 顔タイプのメイン画像は「この顔が正解」という印象を避けるため、実在人物風ではなく、匿名性のある輪郭・ガイド線・曲線/直線の視覚表現にする。
- 次: 結果画面に「画像は診断の断定例ではなく、傾向を理解するためのイメージです」という短い補足を入れるか検討する。

## Phase4 v8: 結果カードの画像ギャラリー表示調整

- やったこと: カラー・顔タイプの補助画像が増えたため、結果カード内のギャラリーを2列グリッドから横スクロール表示へ変更。カードが縦に伸びすぎないようにしつつ、利用者が複数のイメージ例を確認できる表示にした。
- やったこと: 結果画面の「表示について」に、画像はタイプを断定する正解例ではなく、傾向や取り入れ方をイメージするための補助である旨を追加。
- 決めたこと: 画像は診断根拠ではなく、お客様が傾向を理解しやすくするためのビジュアルとして扱う。Supabase、OpenAI Vision、DB、認証には接続しない。
- 次: 実機またはブラウザで結果画面の表示密度を確認し、必要に応じてタイプ別比較ページやアップロード導線側の説明に展開する。

## Phase4 v9: カラー傾向チェックを3枚写真前提に更新

- やったこと: カラー確認用写真を「自然光の正面顔写真」「肌・瞳・髪を見る顔アップ写真」「ベーシック色を当てた写真」の3枚必須に変更。`RequiredPhotoType` と `requiredPhotos` を更新し、アップロード画面と不足写真案内に反映されるようにした。
- やったこと: 結果側のカラー不足案内と根拠文を3枚写真前提に変更。カラー用写真3枚が揃った場合のみ、補助質問と組み合わせてカラー候補を表示する構造にした。
- 決めたこと: 3枚写真でもカラーは照明・加工の影響を受けるため、OpenAI Vision未接続のMVPでは控えめな推定度で扱う。Supabase、OpenAI Vision、DB、認証には接続しない。
- 次: 3枚それぞれの撮影イメージ画像を個別化し、写真アップロード画面で「なぜこの写真が必要か」がさらに伝わる表示にする。
